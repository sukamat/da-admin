export function postProperties({ env, daCtx }) {
  return { body: JSON.stringify([]), status: 201 };
}

export function getProperties({ env, daCtx }) {
  return { body: JSON.stringify([]), status: 200 };
}
