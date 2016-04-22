export default function (queries = [], action) {
  switch (action.type) {
    case 'FETCH_REMOTE_RECORDS':
      return queries.concat({ url: action.url, promise: action.recordsPromise });

    default:
      return queries;
  }
}
