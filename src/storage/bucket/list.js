import {
  S3Client,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils/config';
import { isAuthorized } from '../../utils/auth';

async function formatBuckets(env, daCtx, buckets) {
  const authedBuckets = [];
  for (const bucket of buckets) {
    const name = bucket.Name.replace('-content', '');
    const auth = await isAuthorized(env, name, daCtx.user);
    if (auth) {
      authedBuckets.push({
        name,
        created: bucket.CreationDate
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
      contentType: resp.ContentType
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
