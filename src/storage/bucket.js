import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import getS3Config from './utils';

export async function getBucket(env, project) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  // R2 ONLY
  client.middlewareStack.add((next) => async (args) => {
      args.request.headers['cf-create-bucket-if-missing'] = 'true';
      return next(args);
    },
    {
      step: 'build',
      name: 'createIfMissingMiddleware',
      tags: ['METADATA', 'CREATE-BUCKET-IF-MISSING'],
    });

  const input = { Bucket: 'testing-789', Key: 'hello-world-2.html', Body: 'Hello World!' };
  const command = new PutObjectCommand(input);
  const { $metadata } = await client.send(command);
  return $metadata;
  // const input = {};
  // const command = new ListBucketsCommand(input);
  // const result = await client.send(command);
  // const found = result.Buckets.find((bucket) => bucket.Name === `${project}-da-content`);
  // if (found) return found;
  // return {
  //   status: 404,
  //   text: 'Not found',
  // }
}

export async function createBucket(env, project) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  const input = {};
  const command = new ListBucketsCommand(input);
  const result = await client.send(command);
  return result;
}