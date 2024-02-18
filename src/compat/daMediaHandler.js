import mime from 'mime';
import { MediaHandler } from '@adobe/helix-mediahandler';
import { getDaCtx } from '../utils/daCtx';
import putObject from '../storage/object/put';

export class DAMediaHandler extends MediaHandler {
  constructor(config, req, env, daCtx) {
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
    this.req = req;
    this.daCtx = daCtx;
    this.env = env;
  }

  _daBlob(blob) {
    const ext = mime.getExtension(blob.contentType) || 'bin';
    const uri = `https://admin.da.live/source/${blob.owner}/${blob.repo}/media_${blob.hash}.${ext}`;
    blob.storageUri = uri;
    blob.uri = uri;
    // blob.storageKey = ''; TODO
    return blob;
  }

  async _daUpload(blob) {
    const blobDaCtx = await getDaCtx(new URL(blob.uri).pathname, this.req, this.env);

    // putObject(this.env, blobDaCtx, blob);
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
    this._daUpload(blob);
    return true;
  }

  async put(blob) {
    console.log('put ', blob.storageUri);  // TODO
    this._daUpload(blob);
    return true;
  }

  async spool(blob) {
    console.log('spool ', blob.storageUri);  // TODO
    this._daUpload(blob);
    return true;
  }
}