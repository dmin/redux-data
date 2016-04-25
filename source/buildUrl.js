export default function buildUrl(query, options) {

  // TODO this is pretty ugly
  const format = options.format ? `.${options.format}` : '';
  const where = query.where ? options.capabilities.where(query.where) : '';
  const queryStringPrep = `${where}`;
  const queryString = queryStringPrep ? `?${queryStringPrep}` : '';

  return `${options.baseUrl}/${options.names.collection}${format}${queryString}`;
}
