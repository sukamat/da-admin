import { FORM_CT } from '../utils/constants';
import { putObject } from '../storage/object';
import { getDaCtx } from '../utils/daCtx';

function getFormEntries(formData) {
  return formData.entries().reduce((acc, entry) => {
    if (entry[0] === 'data') {
      acc.data = entry[1];
    }
    if (entry[0] === 'props') {
      ac = JSON.parse(entry[1]);
    }
    return acc;
  }, {});
}

async function formPutHandler(req, env, daCtx) {
  let formData;
  try {
    formData = await req.formData();
  } catch (e) {
    console.log('No form data', e);
  }
  const obj = formData ? getFormEntries(formData) : null;
  return putObject(env, daCtx, obj);
}

async function emptyPutHandler(req, env, daCtx) {
  return putObject(env, daCtx);
}

async function jsonPutHandler(req, env, daCtx) {
  return req.json();
}

export default async function putSourceHandler(c) {
  const { req, env } = c;

  const { pathname } = new URL(req.url);
  const daCtx = getDaCtx(pathname);

  const contentType = req.header('content-type')?.split(';')[0];

  let resp = { error: 'Content type not supported.' };

  if (contentType === 'application/json')
    resp = await jsonPutHandler(req, env, daCtx);

  if (FORM_CT.some((type) => type = contentType ))
    resp = await formPutHandler(req, env, daCtx);

  if (!contentType)
    resp = await emptyPutHandler(req, env, daCtx);

  return c.json(resp);
}