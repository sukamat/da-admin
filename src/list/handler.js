import listBuckets from '../storage/bucket/list';
import listObjects from '../storage/object/list';

export default function listHandler(req, env, daCtx) {
  if (req.method === 'GET') {
    // If there's no org, get a list of buckets a user is authorized for.
    // ...when there's authorization.
    if (!daCtx.org) return listBuckets(env, daCtx);
    return listObjects(env, daCtx);
  }

  return { body: JSON.stringify([]), status: 200, contentType: 'application/json' };
}
