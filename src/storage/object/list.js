import {
  S3Client,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils/config';
import formatList from '../utils/list';

function buildInput({ org, key }) {
  return {
    Bucket: `${org}-content`,
    Prefix: key ? `${key}/` : null,
    Delimiter: '/',
  };
}

export default async function listObjects(env, daCtx) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  const input = buildInput(daCtx);
  const command = new ListObjectsV2Command(input);
  try {
    const resp = await client.send(command);
    // console.log(resp);
    const body = formatList(resp, daCtx);
    return {
      body: JSON.stringify(body),
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
