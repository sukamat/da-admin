const BASE_HEADER_OPTS = {
  "Content-Type": 'application/json',
};

function putHandler(adminCtx) {

}

function getHandler({ project, site }) {
  const headers = new Headers(BASE_HEADER_OPTS);
  const opts = { status: 200, headers };

  const body = {
    source: {
      editUrl: `https://da.live/${project}/${site}`,
      viewUrl: `https://content.da.live/${project}/${site}/`,
      status: 200,
    },
    code: {
      repoUrl: `https://github.com/${project}/${site}`,
    },
    aem: {
      previewUrl: `https://main--${site}--${project}.hlx.page`,
      liveUrl: `https://main--${site}--${project}.hlx.live`,
    }
  }

  return new Response(JSON.stringify(body), opts);
}

export default async function siteHandler(req, env, adminCtx) {

  if (req.method === 'GET')
    return getHandler(adminCtx);

  if (req.method === 'PUT')
    return putHandler(adminCtx);
}