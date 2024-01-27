import getObject from '../storage/object/get';
import putObject from '../storage/object/put';
import deleteObject from '../storage/object/delete';

import putHelper from '../helpers/source';

export async function deleteSource({ env, daCtx }) {
  return deleteObject(env, daCtx);
}

export async function postSource({ req, env, daCtx }) {
  const obj = await putHelper(req, env, daCtx);
  return putObject(env, daCtx, obj);
}

export async function getSource({ env, daCtx }) {
  return getObject(env, daCtx);
}
