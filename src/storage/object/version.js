/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils/config.js';
import listObjects from './list.js';
import getObject from './get.js';

function createBucketIfMissing(client) {
  client.middlewareStack.add(
    (next) => async (args) => {
      // eslint-disable-next-line no-param-reassign
      args.request.headers['cf-create-bucket-if-missing'] = 'true';
      return next(args);
    },
    {
      step: 'build',
      name: 'createIfMissingMiddleware',
      tags: ['METADATA', 'CREATE-BUCKET-IF-MISSING'],
    },
  );
  return client;
}

function ifNoneMatch(config) {
  const client = new S3Client(config);
  createBucketIfMissing(client);
  client.middlewareStack.add(
    (next) => async (args) => {
      // eslint-disable-next-line no-param-reassign
      args.request.headers['If-None-Match'] = '*';
      return next(args);
    },
    {
      step: 'build',
      name: 'ifNoneMatchMiddleware',
      tags: ['METADATA', 'IF-NONE-MATCH'],
    },
  );
  return client;
}

function ifMatch(config, match) {
  const client = new S3Client(config);
  createBucketIfMissing(client);
  client.middlewareStack.add(
    (next) => async (args) => {
      // eslint-disable-next-line no-param-reassign
      args.request.headers['If-Match'] = match;
      return next(args);
    },
    {
      step: 'build',
      name: 'ifMatchMiddleware',
      tags: ['METADATA', 'IF-MATCH'],
    },
  );
  return client;
}

async function get(config, input, body) {
  const client = new S3Client(config);
  createBucketIfMissing(client);
  const command = body ? new GetObjectCommand(input) : new HeadObjectCommand(input);

  try {
    const resp = await client.send(command);
    return {
      body: resp.Body,
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType,
      contentLength: resp.ContentLength,
      metadata: resp.Metadata,
    };
  } catch (e) {
    return { body: '', status: 404, contentLength: 0 };
  }
}

async function putVersion(config, {
  Bucket, Body, ID, Version, Metadata,
}, noneMatch = true) {
  const client = noneMatch ? ifNoneMatch(config) : createBucketIfMissing(new S3Client(config));
  const input = {
    Bucket, Key: `.da-versions/${ID || Version}/${Version}`, Body, Metadata,
  };
  const command = new PutObjectCommand(input);
  return client.send(command);
}

/*
1. resource doesn't exit yet (404 on get)
2. resource does exist but no version yet
3. resource does exist and version(s) exit
*/

function buildInput({
  org, key, body, type,
}) {
  const Bucket = `${org}-content`;
  return {
    Bucket, Key: key, Body: body, ContentType: type,
  };
}

export async function postObjectVersion(env, daCtx) {
  const config = getS3Config(env);
  const update = buildInput(daCtx);
  const current = await get(config, update, true);
  if (current.status === 404) {
    return 404;
  }
  const resp = await putVersion(config, {
    Bucket: update.Bucket, Body: current.body, metadata: current.metadata,
  }, false);
  return resp.status;
}

export async function putObjectWithVersion(env, update, body) {
  const config = getS3Config(env);
  const current = await get(config, update, body);
  if (current.status === 404) {
    const client = ifNoneMatch(config);
    const command = new PutObjectCommand(update);
    const resp = await client.send(command);
    if (resp.status === 412) {
      return putObjectWithVersion(config, update, body);
    }

    return resp.status;
  }
  await putVersion(config, {
    Bucket: update.Bucket, Body: current.body, ID: current.metadata.id, Version: current.metadata.version, Metadata: { test: 'test' },
  });
  if (!current.metadata.id) {
    update.metadata.id = current.metadata.version;
  }
  const client = ifMatch(config, current.etag);
  const command = new PutObjectCommand(update);
  const resp = await client.send(command);
  if (resp.status === 412) {
    return putObjectWithVersion(config, update, body);
  }

  return resp.status === 201 ? 200 : resp.status;
}

export async function getObjectVersion(env, { org, key, head }) {
  return getObject(env, { org, key: `.da-versions/${key}`, head });
}

export async function listObjectVersions(env, { org, key }) {
  const config = getS3Config(env);
  const current = await get(config, { Bucket: `${org}-content`, key });
  if (current.status === 404 || !current.metadata.ID) {
    return 404;
  }
  return listObjects(env, { org, key: `.da-versions/${current.metadata.ID}` });
}
