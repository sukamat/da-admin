import { deleteSource } from '../routes/source';

export default async function deleteHandler({ env, daCtx }) {
  const { path } = daCtx;

  if (path.startsWith('/source')) return deleteSource({ env, daCtx });
}
