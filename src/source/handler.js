import getObject from '../storage/object/get';
import putObject from '../storage/object/put';
import deleteObject from '../storage/object/delete';
import putDocx2HTML from '../word/daDocx2HTML';

import putHelper from './helpers';

export default async function sourceHandler(req, env, daCtx) {
  if (req.method === 'OPTIONS') return { body: '', status: 204 };
  if (req.method === 'DELETE') return deleteObject(env, daCtx);
  if (req.method === 'GET') return getObject(env, daCtx);
  if (req.method === 'PUT') {
    if (daCtx.filename.endsWith('.docx')) {
      return putDocx2HTML(req, env, daCtx);
    }
    const obj = await putHelper(req, env, daCtx);
    return putObject(env, daCtx, obj);
  }
}
