import { getDaCtx } from './utils/daCtx';
import daResp from './utils/daResp';

import getHandler from './handlers/get';
import postHandler from './handlers/post';
import deleteHandler from './handlers/delete';
import unkownHandler from './handlers/unkown';

export default {
  async fetch(req, env) {
    const daCtx = await getDaCtx(req, env);
    if (!daCtx.authorized) return daResp({ status: 401 });

    let respObj;
    switch (req.method) {
      case 'GET':
        respObj = await getHandler({ env, daCtx });
        break;
      case 'PUT':
        respObj = await postHandler({ req, env, daCtx });
        break;
      case 'POST':
        respObj = await postHandler({ req, env, daCtx });
        break;
      case 'DELETE':
        respObj = await deleteHandler({ env, daCtx });
        break;
      case 'OPTIONS':
        respObj = { status: 204 };
        break;
      default:
        respObj = unkownHandler();
    }

    return daResp(respObj);
  },
};
