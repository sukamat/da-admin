// import { html2docx } from '@adobe/helix-importer';
// import { readFile } from 'fs/promises';

import { docx2md } from '@adobe/helix-docx2md';
import { PipelineState, PipelineRequest, htmlPipe } from '@adobe/helix-html-pipeline';
import { DAMediaHandler } from './daMediaHandler';
import putObject from '../storage/object/put';

// hack: override Buffer.toString to avoid exception in setXSurrogateKeyHeader in the html-pipeline
const originalToString = Buffer.prototype.toString;
Buffer.prototype.toString = function(encoding) {
  if (encoding === 'base64url') {
    console.log('base64url invoked');
    return '';
  }
  return originalToString.call(this, encoding);
 }

class StaticS3Loader {
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


// async function getDocx(env, daCtx) {
//   const s3Response = getObject(env, daCtx);
//   const result = await html2docx(URL, HTML, null, {
//     createDocumentFromString,
//   }, {
//     originalURL: ORIGNAL_URL,
//   });

//   console.log('result', result);
// }

export default async function compatHandler(req, env, daCtx) {
  if (req.method === 'OPTIONS') return { body: '', status: 204 };
  if (req.method === 'GET') return {  }
  if (req.method === 'PUT') {
    return docx2HTML(req, env, daCtx);
  }
}

function htmlDACtxFromDocx(ctx) {
  const daCtx = { ...ctx };

  for (let key in daCtx) {
      if (typeof daCtx[key] === 'string') {
        daCtx[key] = daCtx[key].replace('.docx', '.html');
      }
  }
  return daCtx;
}

async function readDocx(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  const data = await file.arrayBuffer();
  const docx = Buffer.from(new Uint8Array(data))
  return docx;
}

async function docx2HTML(req, env, daCtx) {
  const DEFAULT_CONFIG = {
    contentBusId: 'foo-id',
    owner: 'andreituicu',
    repo: 'da-test',
    ref: 'main',
  };

  const opts = {
    mediaHandler: new DAMediaHandler(DEFAULT_CONFIG, req, env, daCtx),
  };

  const doc = await readDocx(req);
  let md = await docx2md(doc, opts);

  // hack: keep the metadata in the document, and not have it extracted by the pipeline
  md = md.replace('<td colspan="2">Metadata</td>', '<td colspan="2">.da.keep.Metadata</td>')

  const url = req.url.replace('.docx', '.plain.html');
  const DEFAULT_STATE = new PipelineState({
    config: DEFAULT_CONFIG,
    site: 'site',
    org: 'org',
    ref: 'main',
    partition: 'source',
    s3Loader: new StaticS3Loader(md),
    path: new URL(url).pathname,
  });
  const request = new PipelineRequest(url);

  const html = await htmlPipe(DEFAULT_STATE, request);
  html.body = html.body.replace('da-keep-metadata', 'metadata');

  html.body = 
`<body>
  <header></header>
  <main>
    ${html.body}
  </main>
  <footer></footer>
</body>`;


  const htmlDACtx = htmlDACtxFromDocx(daCtx);
  return await putObject(env, htmlDACtx, { data: html.body, contentType: 'text/html'});
}