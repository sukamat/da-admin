const env = {
  DA_AUTH: {
    get: () => {
      return { "admin.role.all":["aparker@geometrixx.info"] };
    }
  }
};

export default env;
