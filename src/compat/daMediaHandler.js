import crypto from 'crypto';
import mime from 'mime';
import { MediaHandler } from '@adobe/helix-mediahandler';

export class DAMediaHandler extends MediaHandler {
  constructor(config) {
    super(
      Object.assign(
        {},
        config,
        { 
          disableR2: true,
          contentBusId: 'dummy'
        },
      ),
    );
    this.config = config;
  }

  _daBlob(blob) {
    const ext = mime.getExtension(blob.contentType) || 'bin';
    const uri = `https://admin.da.live/source/${blob.owner}/${blob.repo}/media_${blob.hash}.${ext}`;
    blob.storageUri = uri;
    blob.uri = uri;
    // blob.storageKey = ''; TODO
    return blob;
  }

  createMediaResource(buffer, contentLength, contentType, sourceUri = '') {
    const blob = this._daBlob(
      super.createMediaResource(buffer, contentLength, contentType, sourceUri),
    );

    console.log('created blob', blob);
    return blob;
  }

  async createMediaResourceFromStream(stream, contentLength, contentTypeHint, sourceUri = '') {
    const blob = this._daBlob(
      await super.createMediaResourceFromStream(stream, contentLength, contentTypeHint, sourceUri),
    );

    console.log('created blob', blob);
    return blob;
  }

  async getBlob(sourceUri, src) {
    console.log('getBlob', sourceUri, src);
    // TODO
  }

  async checkBlobExists(blob) {
    console.log('checkBlobExists', blob.uri);

    return false; // TODO
  }

  async fetchHeader(uri) {
    console.log('fetchHeader', uri);
    // TODO
  }

  async putMetaData(blob) {
    console.log('putMetaData', blob.uri);
    // TODO
  }

  async upload(blob) {
    console.log('uploading ', blob.storageUri);  // TODO
    return true;
  }

  async put(blob) {
    console.log('put ', blob.storageUri);  // TODO
    return true;
  }

  async spool(blob) {
    console.log('spool ', blob.storageUri);  // TODO
    return true;
  }
}