import { BASE_HEADER_OPTS, ERR_BODY, ERR_HEADERS } from '../utils/constants';
import { getObject, putObject } from '../storage/object';

function defaultError(daCtx) {
  return new Response(JSON.stringify(daCtx), { ERR_HEADERS });
}

function getFormEntries(formData) {
  return formData.entries().reduce((acc, entry) => {
    if (entry[0] === 'data') {
      acc.data = entry[1];
    }
    if (entry[0] === 'props') {
      acc.props = JSON.parse(entry[1]);
    }
    return acc;
  }, {});
}

async function emptyPutHandler(req, env, daCtx) {
  const resp = await putObject(env, daCtx);
  return new Response(JSON.stringify(resp), { BASE_HEADER_OPTS });
}

async function jsonPutHandler(req, env, daCtx) {
  const json = await req.json();

  return new Response(JSON.stringify(json), { BASE_HEADER_OPTS });
}

async function formPutHandler(req, env, daCtx) {
  let formData;
  try {
    formData = await req.formData();
  } catch (e) {
    console.log('No form data', e);
  }

  const obj = formData ? getFormEntries(formData) : null;
  const resp = await putObject(env, daCtx, obj);
  return new Response(JSON.stringify(resp), { BASE_HEADER_OPTS });
}

async function putHandler(req, env, daCtx) {
  const contentType = req.headers.get('content-type')?.split(';')[0];

  if (contentType === 'application/json')
    return jsonPutHandler(req, env, daCtx);

  if (contentType === 'multipart/form-data'
   || contentType === 'application/x-www-form-urlencoded')
    return formPutHandler(req, env, daCtx);

  if (!contentType)
    return emptyPutHandler(req, env, daCtx);

  return new Response(JSON.stringify(req), { BASE_HEADER_OPTS });
}

async function getHandler(req, env, daCtx) {
  const resp = await getObject(env, daCtx);
  if (!resp.$metadata) return defaultError(daCtx);

  const body = JSON.stringify({ ...daCtx, $metadata: resp.$metadata });
  return new Response(body, { BASE_HEADER_OPTS });
}

export default async function sourceHandler(req, env, adminCtx) {
  if (req.method === 'GET') return getHandler(req, env, adminCtx);

  if (req.method === 'PUT') return putHandler(req, env, adminCtx);
}