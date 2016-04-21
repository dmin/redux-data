export default function findCachedOrPendingQuery(previousQueries, url) {
  const [match] = previousQueries.filter(previousQuery => {
    return previousQuery.url === url;
  });

  return (match && match.promise) || null;
}
