export default function buildUrl(query, options) {

  const format = options.format ? `.${options.format}` : '';

  return `${options.baseUrl}/${options.names.collection}${format}`;
}
