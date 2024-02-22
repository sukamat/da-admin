import { docx2md } from '@adobe/helix-docx2md';
import { PipelineState, PipelineRequest, htmlPipe } from '@adobe/helix-html-pipeline';
import { DAMediaHandler } from './daMediaHandler';
import { DAMockStaticS3Loader } from './daMockStaticS3Loader';
import putObject from '../storage/object/put';

// hack: override Buffer.toString to avoid exception in setXSurrogateKeyHeader in the html-pipeline
const originalToString = Buffer.prototype.toString;
Buffer.prototype.toString = function(encoding) {
  if (encoding === 'base64url') {
    return '';
  }
  return originalToString.call(this, encoding);
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

export default async function putDocx2HTML(req, env, daCtx) {
  const doc = await readDocx(req);

  const DEFAULT_CONFIG = {
    contentBusId: 'foo-id',
    owner: daCtx.org, // ?? TODO: How to retrieve this in hlx5?
    repo: daCtx.site, // ?? TODO: How to retrieve this in hlx5?
    ref: 'main',
  };

  let md = await docx2md(
    doc,
    {
      mediaHandler: new DAMediaHandler(DEFAULT_CONFIG, req, env, daCtx),
    },
  );

  // hack: keep the metadata in the document, and not have it extracted by the pipeline
  md = md.replaceAll('<td colspan="2">Metadata</td>', '<td colspan="2">.da.keep.Metadata</td>')
  // hack: keep absolute links. don't let the html pipeline make them relative
  md = md.replaceAll('.hlx.live', '.hlx_dakeep_.live')
       .replaceAll('.hlx.page', '.hlx_dakeep_.page')
       .replaceAll('.aem.live', '.aem_dakeep_.live')
       .replaceAll('.aem.page', '.aem_dakeep_.page');

  const url = req.url.replace('.docx', '.plain.html');
  const DEFAULT_STATE = new PipelineState({
    config: DEFAULT_CONFIG,
    site: daCtx.site,
    org: daCtx.org,
    ref: 'main',
    partition: 'source',
    s3Loader: new DAMockStaticS3Loader(md),
    path: new URL(url).pathname,
  });
  const request = new PipelineRequest(url);

  const html = await htmlPipe(DEFAULT_STATE, request);
  // restore modified elements
  html.body = html.body.replaceAll('da-keep-metadata', 'metadata');
  html.body = html.body.replaceAll('.hlx_dakeep_.live', '.hlx.live')
    .replaceAll('.hlx_dakeep_.page', '.hlx.page')
    .replaceAll('.aem_dakeep_.live', '.aem.live')
    .replaceAll('.aem_dakeep_.page', '.aem.page')

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