import { FORM_TYPES } from '../utils/constants';

/**
 * Builds a source response
 * @param {*} key 
 */
export function sourceRespObject(daCtx, props) {
  console.log(daCtx);
  const { org, site, isFile, pathname, aemPathname } = daCtx;
  return {
      source: {
        editUrl: `https://da.live/${isFile ? 'edit#/' : ''}${org}${pathname}`,
        contentUrl: `https://content.da.live/${org}${pathname}`,
        props,
      },
      aem: {
        previewUrl: `https://main--${site}--${org}.hlx.page${aemPathname}`,
        liveUrl: `https://main--${site}--${org}.hlx.live${aemPathname}`,
      }
  }
}

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
