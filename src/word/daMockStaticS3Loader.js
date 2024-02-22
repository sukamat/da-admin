export class DAMockStaticS3Loader {
  constructor(md) {
    this.md = md;
  }

  async getObject(bucketId, key) {
    return {
      status: 200,
      body: this.md,
      headers: new Map(),
    };
  }

  async headObject(bucketId, key) {
    return this.getObject();
  }
}