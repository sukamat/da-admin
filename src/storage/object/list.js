import {
  S3Client,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils';

function buildInput({ org, key }) {
  return {
    Bucket: `${org}-content`,
    Prefix: key ? `${key}/` : null,
    Delimiter: '/',
  };
}

function combineCommonContents(resp) {
  const { CommonPrefixes, Contents } = resp;

  const combined = [];

  if (CommonPrefixes) {
    CommonPrefixes.forEach((prefix) => {
      console.log(prefix);
      combined.push({ name: prefix.Prefix.slice(0, -1).split('/').pop() });
    });
  }

  if (Contents) {
    Contents.forEach((content) => {
      if (!content.Key.endsWith('.props')) {
        combined.push({ name: content.Key.split('/').pop() });
      }
    });
  }

  return combined;
}

export default async function getObjects(env, daCtx) {
  console.log(daCtx);
  const config = getS3Config(env);
  const client = new S3Client(config);

  const input = buildInput(daCtx);
  console.log(input);
  const command = new ListObjectsV2Command(input);
  try {
    const resp = await client.send(command);
    // console.log(resp);
    const body = combineCommonContents(resp);
    return {
      body: JSON.stringify(body),
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
