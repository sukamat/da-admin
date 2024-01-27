/* eslint-env mocha */
import assert from 'assert';
import { getDaCtx } from '../../src/utils/daCtx.js';

// Mocks
import reqs from './mocks/req.js';
import env from './mocks/env.js';

describe('Dark Alley Context', () => {
  describe('Org context', async () => {
    const daCtx = await getDaCtx(reqs.org, env);

    it('should return an undefined site', () => {
      assert.strictEqual(daCtx.site, undefined);
    });

    it('should return a blank filename', () => {
      assert.strictEqual(daCtx.filename, '');
    });
  });

  describe('Site context', async () => {
    const daCtx = await getDaCtx(reqs.site, env);

    it('should return a props key', () => {
      assert.strictEqual(daCtx.propsKey, 'geometrixx.props');
    });
  });

  describe('Sanitize string', async () => {
    const daCtx = await getDaCtx(reqs.file, env);
    it('should return a lowercase key', () => {
      assert.strictEqual(daCtx.site, 'geometrixx');
    });
  });

  describe('Folder context', async () => {
    const daCtx = await getDaCtx(reqs.folder, env);

    it('should return an api', () => {
      assert.strictEqual(daCtx.api, 'source');
    });

    it('should return an owner', () => {
      assert.strictEqual(daCtx.org, 'cq');
    });

    it('should return a key', () => {
      assert.strictEqual(daCtx.key, 'geometrixx/nft');
    });

    it('should return a props key', () => {
      assert.strictEqual(daCtx.propsKey, 'geometrixx/nft.props');
    });

    it('should not have an extension', () => {
      assert.strictEqual(daCtx.ext, undefined);
    });
  });

  describe('File context', async () => {
    const daCtx = await getDaCtx(reqs.file, env);

    it('should return a name', () => {
      assert.strictEqual(daCtx.name, 'outreach');
    });

    it('should return an extension', () => {
      assert.strictEqual(daCtx.ext, 'html');
    });

    it('should return a props key', () => {
      assert.strictEqual(daCtx.propsKey, 'geometrixx/nft/outreach.html.props');
    });
  });

  describe('Media context', async () => {
    const daCtx = await getDaCtx(reqs.media, env);

    it('should return a props key', () => {
      assert.strictEqual(daCtx.aemPathname, '/nft/blockchain.png');
    });
  });
});
