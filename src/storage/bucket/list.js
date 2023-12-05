import {
  S3Client,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils/config';

function formatBuckets(buckets) {
  console.log(buckets);
  return buckets.map((bucket) => {
    return {
      name: bucket.Name.replace('-content', ''),
      created: bucket.CreationDate
    };
  })
}

export default async function listBuckets(env, daCtx) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  const command = new ListBucketsCommand({});
  try {
    const resp = await client.send(command);
    return {
      body: JSON.stringify(formatBuckets(resp.Buckets)),
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
