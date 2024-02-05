const optsWithEmptyHead = {
  headers: new Headers(),
};

const optsWithEmptyBearer = {
  headers: new Headers({
    'Authorization': ` `,
  }),
};

const optsWithAuth = {
  headers: new Headers({
    'Authorization': `Bearer aparker@geometrixx.info`,
  }),
};

const optsWithExpAuth = {
  headers: new Headers({
    'Authorization': `Bearer aparker@geometrixx.info:100:-150`,
  }),
};

const optsWithMultiAuthAnon = {
  headers: new Headers({
    'Authorization': `,Bearer aparker@geometrixx.info`
  }),
};

const optsWithForceFail = {
  headers: new Headers({
    'x-mock-fail': true,
    'Authorization': `Bearer aparker@geometrixx.info`,
  }),
};

const reqs = {
  org: new Request('https://da.live/source/cq/', optsWithEmptyHead),
  site: new Request('https://da.live/source/cq/Geometrixx', optsWithAuth),
  folder: new Request('https://da.live/source/cq/Geometrixx/NFT/', optsWithExpAuth),
  file: new Request('https://da.live/source/cq/Geometrixx/NFT/Outreach.html', optsWithEmptyBearer),
  media: new Request('https://da.live/source/cq/Geometrixx/NFT/blockchain.png', optsWithForceFail),
  siteMulti: new Request('https://da.live/source/cq/Geometrixx', optsWithMultiAuthAnon),
};

export default reqs;
