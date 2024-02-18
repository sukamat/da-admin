// import { html2docx } from '@adobe/helix-importer';
import { readFile } from 'fs/promises';
import fs from 'fs';
import { docx2md } from '@adobe/helix-docx2md';
import { PipelineState, PipelineRequest, htmlPipe } from '@adobe/helix-html-pipeline';
import { DAMediaHandler } from './daMediaHandler.js';

export class StaticS3Loader {
  constructor(md) {
    this.md = md;
  }

  async getObject(bucketId, key) {
    console.log('getObject', bucketId, key);
    return {
      status: 200,
      body: this.md,
      headers: new Map(),
    };
  }

  async headObject(bucketId, key) {
    console.log('headObject', bucketId, key);
    return this.getObject();
  }
}

// import getObject from '../storage/object/get';
// import putObject from '../storage/object/put';

// import putHelper from './helpers';

// async function getDocx(env, daCtx) {
//   const s3Response = getObject(env, daCtx);
//   const result = await html2docx(URL, HTML, null, {
//     createDocumentFromString,
//   }, {
//     originalURL: ORIGNAL_URL,
//   });

//   console.log('result', result);
// }

export default async function sourceHandler(req, env, daCtx) {
  if (req.method === 'OPTIONS') return { body: '', status: 204 };
  if (req.method === 'GET') return {  }
  if (req.method === 'PUT') {
    const obj = await putHelper(req, env, daCtx);
    return putObject(env, daCtx, obj);
  }
}

async function docx2HTML(req, env, daCtx) {
  const DEFAULT_CONFIG = {
    contentBusId: 'foo-id',
    owner: 'andreituicu',
    repo: 'da-test',
    ref: 'main',
  };

  const sourceDoc = 'mytest';
  const opts = {
    mediaHandler: new DAMediaHandler(DEFAULT_CONFIG),
  };
  const doc = await readFile(`${sourceDoc}.docx`);
  const md = await docx2md(doc, opts);

  const DEFAULT_STATE = new PipelineState({
    config: DEFAULT_CONFIG,
    site: 'site',
    org: 'org',
    ref: 'main',
    partition: 'source',
    s3Loader: new StaticS3Loader(md),
  });

  const request = new PipelineRequest('https://www.example.com/index.html');

  // const dast = await docx2dast(doc, opts);
  // const mdast = await dast2mdast(dast, opts);
  const html = await htmlPipe(DEFAULT_STATE, request);
  fs.writeFileSync(`${sourceDoc}.html`, html.body);
}

docx2HTML();
