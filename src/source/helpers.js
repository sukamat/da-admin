import { FORM_TYPES } from '../utils/constants';

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

async function formPutHandler(req) {
  let formData;
  try {
    formData = await req.formData();
  } catch (e) {
    console.log('No form data', e);
  }
  return formData ? getFormEntries(formData) : null;
}

export default async function putHelper(req, env, daCtx) {
  const contentType = req.headers.get('content-type')?.split(';')[0];

  if (FORM_TYPES.some((type) => type = contentType ))
    return formPutHandler(req, env, daCtx);

  if (!contentType) return null;
}
