export default function (queries = [], action) {
  switch (action.type) {
    case 'FETCH_REMOTE_RECORDS':
      return queries.concat({ serializedQuery: action.serializedQuery, promise: action.recordsPromise });

    default:
      return queries;
  }
}
