export default function formatList(resp, daCtx) {
  function compare(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return undefined;
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
      combined.push({ path, name });
    });
  }

  if (Contents) {
    Contents.forEach((content) => {
      const itemName = content.Key.split('/').pop();
      const splitName = itemName.split('.');
      // file.jpg.props should not be a part of the list
      // hidden files (.props) should not be a part of this list
      if (splitName.length !== 2) return;

      const [name, ext, props] = splitName;

      // Do not show any props sidecar files
      if (props) return;

      // See if the folder is already in the list
      if (ext === 'props') {
        if (combined.some((item) => item.name === name)) return;

        // Remove props from the key so it can look like a folder
        content.Key = content.Key.replace('.props', '');
      }

      // Do not show any hidden files.
      if (!name) return;
      const item = { path: `/${daCtx.org}/${content.Key}`, name };
      if (ext !== 'props') item.ext = ext;

      combined.push(item);
    });
  }

  return combined.sort(compare);
}
