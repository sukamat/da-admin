import { deleteSource } from '../routes/source.js';

export default async function deleteHandler({ env, daCtx }) {
  const { path } = daCtx;

  if (path.startsWith('/source')) return deleteSource({ env, daCtx });

  return undefined;
}
