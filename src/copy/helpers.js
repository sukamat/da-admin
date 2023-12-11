export default async function copyHelper(req, daCtx) {
  const formData = await req.formData();
  if (!formData) return {};
  const fullDest = formData.get('destination');
  const lower = fullDest.slice(1).toLowerCase();
  const sanitized = lower.endsWith('/') ? lower.slice(0, -1) : lower;
  const destination = sanitized.split('/').slice(1).join('/');
  const source = daCtx.key;
  return { source, destination };
}
