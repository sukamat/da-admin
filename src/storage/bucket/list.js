import {
  S3Client,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils';

export default async function listBuckets(env, daCtx) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  const command = new ListBucketsCommand({});
  try {
    const resp = await client.send(command);
    return {
      body: JSON.stringify(resp.Buckets),
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
