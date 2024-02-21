import { PassThrough, Transform } from 'stream';
import mime from 'mime';
import {createHash} from "sha1-uint8array";

import sizeOf from 'image-size';

sizeOf.disableFS(true);

// cache external urls
const blobCache = {};

// request counter for logging
let requestCounter = 0;

const FETCH_CACHE_SIZE = 10 * 1024 * 1024; // 10mb

/**
 * Number of retries in fetchHeader
 */
const MAX_RETRIES = 3;


export class MediaHandler {
  constructor(opts = {}) {
    Object.assign(this, {
      _bucketId: opts.bucketId || 'helix-media-bus',
      _contentBusId: opts.contentBusId,
      _owner: opts.owner,
      _repo: opts.repo,
      _ref: opts.ref,

      _log: opts.log || console,
      _noCache: opts.noCache,
      _uploadBufferSize: opts.uploadBufferSize || 1024 * 1024 * 5,

      // estimated bandwidth for copying blobs (should be dynamically adapted).
      _bandwidth: 1024 * 1024, // bytes/s

      // start time of the action
      _startTime: Date.now(),

      // maximum time allowed (the default timeout we allow in pipeline is 20s. be conservative)
      _maxTime: opts.maxTime || 10 * 1000,

      // list of uploads (scheduled and completed)
      _uploads: [],

      // blob filter
      _filter: opts.filter || (() => true),

      // authentication header for sources
      _auth: opts.auth || null,

      // resource name prefix
      _namePrefix: opts.namePrefix || '',

      _blobAgent: opts.blobAgent || `da-media-handler`,
    });

    if (!this._owner || !this._repo || !this._ref || !this._contentBusId) {
      throw Error('owner, repo, ref, and contentBusId are mandatory parameters.');
    }

    this._cache = blobCache[this._contentBusId];
    if (!this._cache) {
      blobCache[this._contentBusId] = {};
      this._cache = blobCache[this._contentBusId];
    }

  }

  static updateBlobURI(blob) {
    const {
      owner,
      repo,
      ref,
      hash,
    } = blob;
    const ext = mime.getExtension(blob.contentType) || 'bin';
    let fragment = '';
    if (blob.meta && blob.meta.width && blob.meta.height && !blob.contentType?.match(/^video\/[^/]+$/)) {
      fragment = `#width=${blob.meta.width}&height=${blob.meta.height}`;
    }
    blob.uri = `https://${ref}--${repo}--${owner}.hlx.page/media_${hash}.${ext}${fragment}`;
    return blob;
  }

  _getDimensions(data, c) {
    if (!data) {
      return {};
    }
    // const info = new Parser(data, this._log).parse();
    // if (info) {
    //   return {
    //     width: String(info.width),
    //     height: String(info.height),
    //     duration: String(info.duration),
    //     type: info.mimeType,
    //   };
    // }

    try {
      const dimensions = sizeOf(data);
      this._log.info(`[${c}] detected dimensions: ${dimensions.type} ${dimensions.width} x ${dimensions.height}`);
      return {
        width: String(dimensions.width),
        height: String(dimensions.height),
        type: mime.getType(dimensions.type),
      };
    } catch (e) {
      this._log.warn(`[${c}] error detecting dimensions: ${e}`);
      return {};
    }
  }

  _initMediaResource(buffer, contentLength) {
    // compute hashes
    let hashBuffer = buffer;
    if (hashBuffer.length > 8192) {
      hashBuffer = hashBuffer.slice(0, 8192);
    }

    // TODO: crypto is not supported in wrangler, added polyfill, but it's not creating the same hash 
    const crypto = {
      createHash: createHash
    }
    const contentHash = crypto.createHash('sha1')
      // .update(String(contentLength))
      .update(hashBuffer)
      .digest('hex');
    const hash = `1${contentHash}`;
    const storageKey = `${this._contentBusId}/${this._namePrefix}${hash}`;

    return MediaHandler.updateBlobURI({
      storageUri: `s3://${this._bucketId}/${storageKey}`,
      storageKey,
      owner: this._owner,
      repo: this._repo,
      ref: this._ref,
      contentBusId: this._contentBusId,
      contentLength,
      hash,
    });
  }

  async createMediaResourceFromStream(stream, contentLength, contentType, sourceUri = '') {
    if (!contentLength) {
      throw Error('createExternalResourceFromStream() needs contentLength');
    }
    // in order to compute hash, we need to read at least 8192 bytes
    const partialBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      let read = 0;
      const readMax = Math.min(contentLength, 8192);

      const done = () => {
        // eslint-disable-next-line no-use-before-define
        stream.removeListener('readable', onReadable);
        // eslint-disable-next-line no-use-before-define
        stream.removeListener('end', onEnd);
        const buf = Buffer.concat(chunks);
        stream.unshift(buf);
        resolve(buf);
      };
      /* c8 ignore next 3 */
      const onEnd = () => {
        done();
      };
      const onReadable = () => {
        let chunk;
        // eslint-disable-next-line yoda, no-cond-assign
        while (null !== (chunk = stream.read())) {
          chunks.push(chunk);
          read += chunk.length;
          if (read >= readMax) {
            done();
            break;
          }
        }
      };

      stream.on('readable', onReadable);
      stream.on('end', onEnd);
      stream.on('error', (e) => {
        reject(Error(`Error reading stream: ${e.code}`));
      });
    });

    // compute hash
    const resource = this._initMediaResource(partialBuffer, contentLength);

    // try to detect dimensions
    const { type, ...dims } = this._getDimensions(partialBuffer, '');

    return MediaHandler.updateBlobURI({
      sourceUri,
      stream,
      contentType: MediaHandler.getContentType(type, contentType, sourceUri),
      ...resource,
      meta: {
        alg: '8k',
        agent: this._blobAgent,
        src: sourceUri,
        ...dims,
      },
    });
  }

    /**
   * Returns the best content type. Prioritizes the detected content type over the hinted one over
   * the one derived from the uri. By also favoring non application/octet-stream ones.
   */
    static getContentType(detectedType, hintedType, uri) {
      const uriType = mime.getType(uri);
      // get first non octet stream type
      for (const type of [detectedType, hintedType, uriType]) {
        if (type && type !== 'application/octet-stream') {
          return type;
        }
      }
      return 'application/octet-stream';
    }
}