/* eslint-env mocha */
import assert from 'assert';
import { getDaCtx } from '../../src/utils/daCtx.js';

describe('Dark Alley Context', () => {
  describe('Site context', () => {
    const daCtx = getDaCtx('/source/adobecom/blog');

    it('should return a key', () => {
      assert.strictEqual(daCtx.key, 'blog.props');
    });
  });

  describe('Folder context', () => {
    const daCtx = getDaCtx('/source/adobecom/blog/en/publish');

    it('should return an api', () => {
      assert.strictEqual(daCtx.api, 'source');
    });

    it('should return an owner', () => {
      assert.strictEqual(daCtx.org, 'adobecom');
    });

    it('should return a key', () => {
      assert.strictEqual(daCtx.key, 'blog/en/publish.props');
    });
  });

  describe('File context', () => {
    const daCtx = getDaCtx('/source/adobecom/blog/en/publish/picture.jpg');

    it('should return a name', () => {
      assert.strictEqual(daCtx.name, 'picture.jpg');
    });

    it('should return an extension', () => {
      assert.strictEqual(daCtx.ext, 'jpg');
    });

    it('should return a props key', () => {
      assert.strictEqual(daCtx.propsKey, 'blog/en/publish/picture.jpg.props');
    });
  });
});