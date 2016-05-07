export default function findCachedOrPendingQuery(previousQueries, serializedQuery) {
  const [match] = previousQueries.filter(previousQuery => {
    return previousQuery.serializedQuery === serializedQuery;
  });

  return (match && match.promise) || null;
}
