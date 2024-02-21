import { FORM_TYPES } from '../utils/constants';

/**
 * Builds a source response
 * @param {*} key 
 */
export function sourceRespObject(daCtx, props) {
  const { org, site, isFile, pathname, aemPathname } = daCtx;

  const obj = {
      source: {
        editUrl: `https://da.live/${isFile ? 'edit#/' : ''}${org}${pathname}`,
        contentUrl: `https://content.da.live/${org}${pathname}`,
      }
  }

  if (props) obj.source.props = props;

  if (site) {
    obj.aem = {
      previewUrl: `https://main--${site}--${org}.hlx.page${aemPathname}`,
      liveUrl: `https://main--${site}--${org}.hlx.live${aemPathname}`,
    }
  }

  return obj;
}

function getFormEntries(formData) {
  const entries = {};

  if (formData.get('data')) {
    entries.data = formData.get('data');
  }

  if (formData.get('props')) {
    entries.props = JSON.parse(formData.get('props'));
  }

  if (formData.get('file')) {
    entries.file = formData.get('file');
  }

  return entries
}

async function formPutHandler(req) {
  let formData;
  try {
    console.log('Reading data...');
    formData = await req.formData();
    console.log('Finished reading data.', formData);
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
