export default function findCachedOrPendingQuery(previousQueries, query) {
  const [match] = previousQueries.filter(previousQuery => {
    return previousQuery.id === JSON.stringify(query);
  });

  return (match && match.promise) || null;
}
