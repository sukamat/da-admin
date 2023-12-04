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

function combineCommonContents(resp, daCtx) {
  function compare(a, b) {
    if (a.name < b.name ) return -1;
    if ( a.name > b.name ) return 1;
    return 0;
  }

  const { CommonPrefixes, Contents } = resp;

  const combined = [];

  if (CommonPrefixes) {
    CommonPrefixes.forEach((prefix) => {
      const name = prefix.Prefix.slice(0, -1).split('/').pop();
      const splitName = name.split('.');

      // Do not add any extension folders
      if (splitName.length > 1) return;

      const path = `/${daCtx.org}/${prefix.Prefix.slice(0, -1)}`;
      combined.push({ name, path });

    });
  }

  if (Contents) {
    Contents.forEach((content) => {
      
        const name = content.Key.split('/').pop();
        if (!name) return;
        // Do this on the server now because one day (?!) this should be done with content types.
        const splitName = name.split('.');
        // Only show true files not hidden files (.props)
        if (splitName[0]) {
          const ext = splitName.pop();
          const isFile = splitName.length > 0 && ext !== 'props';
          combined.push({ path: `/${daCtx.org}/${content.Key}`, name, ext, isFile });
        }

    });
  }

  return combined.sort(compare);
}

export default async function getObjects(env, daCtx) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  const input = buildInput(daCtx);
  const command = new ListObjectsV2Command(input);
  try {
    const resp = await client.send(command);
    // console.log(resp);
    const body = combineCommonContents(resp, daCtx);
    return {
      body: JSON.stringify(body),
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType
    };
  } catch (e) {
    return { body: '', status: 404 };
  }
}
