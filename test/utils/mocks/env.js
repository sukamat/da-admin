const NAMESPACES = {
  'geometrixx-da-props': { "admin.role.all":["aparker@geometrixx.info"] },
  'beagle-da-props': { },
}

const env = {
  DA_AUTH: {
    get: (kvNamespace) => {
      return NAMESPACES[kvNamespace];
    },
    put: (kvNamespace, value, expObj) => {},
  }
};

export default env;
