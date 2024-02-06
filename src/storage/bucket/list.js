import {
  S3Client,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils/config.js';
import { isAuthorized } from '../../utils/auth.js';

async function formatBuckets(env, daCtx, buckets) {
  const authedBuckets = [];
  for (const bucket of buckets) {
    const name = bucket.Name.replace('-content', '');
    let auth = true;
    // check for all users in the session if they are authorized
    for (const user of daCtx.users) {
      if (!await isAuthorized(env, name, user)) {
        auth = false;
        break;
      }
    }
    if (auth) {
      authedBuckets.push({
        name,
        created: bucket.CreationDate,
      });
    }
  }
  return authedBuckets;
}

export default async function listBuckets(env, daCtx) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  const command = new ListBucketsCommand({});
  try {
    const resp = await client.send(command);
    return {
      body: JSON.stringify(await formatBuckets(env, daCtx, resp.Buckets)),
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType,
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
