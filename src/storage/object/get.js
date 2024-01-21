import {
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils/config';

function buildInput({ org, key }) {
  const Bucket = `${org}-content`;
  return { Bucket, Key: key };
}

export default async function getObject(env, { org, key }) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  const input = buildInput({ org, key });
  const command = new GetObjectCommand(input);

  try {
    const resp = await client.send(command);
    return {
      body: resp.Body,
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
