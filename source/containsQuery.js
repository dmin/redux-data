import deepEqual from 'deep-equal';

export default function containsQuery(queryList, newQuery) {
  return queryList.some(existingQuery => {
    return deepEqual(existingQuery, newQuery, { strict: true });
  });
}
