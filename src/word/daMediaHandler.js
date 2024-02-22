import path from 'path';
import mime from 'mime';
import { getDaCtx } from '../utils/daCtx';
import putObject from '../storage/object/put';
import { MediaHandler } from './hlxMediaHandler';
import getObject from '../storage/object/get';

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
    this.env = env;
    this.folder = path.dirname(daCtx.aemPathname);
  }

  _daBlob(blob) {
    const ext = mime.getExtension(blob.contentType) || 'bin';
    const uri = `https://admin.da.live/source/${blob.owner}/${blob.repo}${path.join(this.folder, `/media_${blob.hash}.${ext}`)}`;
    blob.storageUri = uri;
    blob.uri = uri;
    blob.storageKey = ''; // TODO
    return blob;
  }

  async _daUpload(blob) {
    const blobDaCtx = await getDaCtx(new URL(blob.uri).pathname, this.req, this.env);
    const response = await putObject(this.env, blobDaCtx, blob);
    return response && response.status === 201;
  }

  createMediaResource(buffer, contentLength, contentType, sourceUri = '') {
    const blob = this._daBlob(
      super.createMediaResource(buffer, contentLength, contentType, sourceUri),
    );

    return blob;
  }

  async createMediaResourceFromStream(stream, contentLength, contentTypeHint, sourceUri = '') {
    const blob = this._daBlob(
      await super.createMediaResourceFromStream(stream, contentLength, contentTypeHint, sourceUri),
    );

    return blob;
  }

  async getBlob(sourceUri, src) {
    console.log('getBlob', sourceUri, src);
    // TODO
  }

  async checkBlobExists(blob) {
    const blobDaCtx = await getDaCtx(new URL(blob.uri).pathname, this.req, this.env);
    const response = await getObject(this.env, blobDaCtx);
    if (!response) return false;
    return response.status === 200;
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
    return await this._daUpload(blob);
  }

  async put(blob) {
    return await this._daUpload(blob);
  }

  async spool(blob) {
    return await this._daUpload(blob);
  }
}