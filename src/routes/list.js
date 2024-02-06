import listBuckets from '../storage/bucket/list.js';
import listObjects from '../storage/object/list.js';

export default function getList({ env, daCtx }) {
  if (!daCtx.org) return listBuckets(env, daCtx);
  return listObjects(env, daCtx);
}
