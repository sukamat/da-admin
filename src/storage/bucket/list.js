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
  ListBucketsCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils/config.js';
import { isAuthorized } from '../../utils/auth.js';

async function formatBuckets(env, daCtx, buckets) {
  const authedBuckets = [];
  for (const bucket of buckets) {
    const name = bucket.Name.replace('-content', '');
    let auth = true;
    // check for all users in the session if they are authorized
    for (const user of daCtx.users) {
      if (!await isAuthorized(env, name, user)) {
        auth = false;
        break;
      }
    }
    if (auth) {
      authedBuckets.push({
        name,
        created: bucket.CreationDate,
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
      contentType: resp.ContentType,
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
