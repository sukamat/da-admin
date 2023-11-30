import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils';
import { sourceRespObject } from '../../source/helpers';

async function getFileBody(data) {
  await data.text();
  console.log(data);
  return { body: data, type: data.type };
}

function getObjectBody(data) {
  // TODO: This will not correctly handle HTML as data
  return { body: JSON.stringify(data), type: 'application/json' };
}

function buildInput({ org, key, body, type }) {
  const Bucket = `${org}-content`;
  return { Bucket, Key: key, Body: body, ContentType: type };
}

function createBucketIfMissing(client) {
  client.middlewareStack.add((next) => async (args) => {
    args.request.headers['cf-create-bucket-if-missing'] = 'true';
    return next(args);
  },
  {
    step: 'build',
    name: 'createIfMissingMiddleware',
    tags: ['METADATA', 'CREATE-BUCKET-IF-MISSING'],
  });
}

export default async function putObject(env, daCtx, obj) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  // R2 ONLY FEATURE
  createBucketIfMissing(client);

  const { org, key, propsKey } = daCtx;

  const inputs = [];

  if (obj) {
    if (obj.data) {
      const isFile = obj.data instanceof File;
      const { body, type } = isFile ? await getFileBody(obj.data) : getObjectBody(obj.data);
      inputs.push(buildInput({ org, key, body, type }));
    }
    if (obj.props) {
      const { body, type } = getObjectBody(obj.props);
      const inputConfig = { org, key: propsKey || key, body, type };
      inputs.push(buildInput(inputConfig));
    }
  } else {
    // Make a bare bones folder
    const { body, type } = getObjectBody({});
    const inputConfig = { org, key, body, type };
    inputs.push(buildInput(inputConfig));
  }

  for (const input of inputs) {
    const command = new PutObjectCommand(input);
    await client.send(command);
  }

  const body = sourceRespObject(daCtx, obj?.props);
  return { body: JSON.stringify(body), status: 201, contentType: 'application/json' };
}
