import getObject from '../storage/object/get';
import putObject from '../storage/object/put';

import putHelper from './helpers';

export default async function sourceHandler(req, env, daCtx) {
  if (req.method === 'OPTIONS') return { body: '', status: 204 };
  if (req.method === 'GET') return getObject(env, daCtx);
  if (req.method === 'PUT') {
    const obj = await putHelper(req, env, daCtx);
    return putObject(env, daCtx, obj);
  }
}
