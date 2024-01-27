import listBuckets from '../storage/bucket/list';
import listObjects from '../storage/object/list';

export default function getList({ env, daCtx }) {
  if (!daCtx.org) return listBuckets(env, daCtx);
  return listObjects(env, daCtx);
}
