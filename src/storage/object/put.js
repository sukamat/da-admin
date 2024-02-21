import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';


import getS3Config from '../utils/config';
import { sourceRespObject } from '../../source/helpers';

async function getFileBody(data) {
  await data.text();
  return { body: data, type: data.type };
}

function getObjectBody(data) {
  // TODO: This will not correctly handle HTML as data
  return { body: JSON.stringify(data), type: 'application/json' };
}

function buildInput({ org, key, body, type, contentLength }) {
  const Bucket = `${org}-content`;
  return { 
    Bucket, 
    Key: key, 
    Body: body, 
    ContentType: type, 
   // ContentLength: contentLength,
  };
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
      if (obj.contentType === 'text/html') {
        inputs.push(
          buildInput(
            { 
              org,
              key,
              body: obj.data,
              type: obj.contentType,
              // contentLength: obj.data.length,
            },
          ),
        );
      } else if (obj.data instanceof File) {
        const { body, type } = await getFileBody(obj.data);
        inputs.push(buildInput({ org, key, body, type }));
      } else {
        const { body, type } = getObjectBody(obj.data);
        inputs.push(buildInput({ org, key, body, type }));
      }
    }
    if (obj.stream) {
      inputs.push(
        buildInput({ 
          org,
          key,
          body: obj.stream,
          type: obj.contentType,
          contentLength: obj.stream.actualByteCount,
        }),
      );
    }
    if (obj.props) {
      const { body, type } = getObjectBody(obj.props);
      const inputConfig = { org, key: propsKey || key, body, type };
      inputs.push(buildInput(inputConfig));
    }
  } else {
    const { body, type } = getObjectBody({});
    const inputConfig = { org, key: propsKey, body, type };
    inputs.push(buildInput(inputConfig));
  }

  for (const input of inputs) {
    console.log('put input', input);
    const command = new PutObjectCommand(input);
    console.log('put command', command);
    try {
      const response = await client.send(command);
      console.log('put response', response);
    } catch (e) {
      console.log('put error', e);
    }
  }

  const body = sourceRespObject(daCtx, obj?.props);
  return { body: JSON.stringify(body), status: 201, contentType: 'application/json' };
}
