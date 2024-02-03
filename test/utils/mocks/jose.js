const decodeJwt = (token) => {
  const [
    email,
    created_at = Math.floor(new Date().getTime() / 1000),
    expires_in
  ] = token.split(':');
  return {
    user_id: email,
    created_at,
    expires_in: expires_in || created_at + 1000,
  }
};

export default { decodeJwt };
