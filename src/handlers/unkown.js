export default function unkownHandler() {
  const body = JSON.stringify({ message: 'Unknown method. Please see: https://docs.da.live for more information.' });
  return { body, status: 501 };
}
