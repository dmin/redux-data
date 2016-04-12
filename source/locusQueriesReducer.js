export default function (queries = [], action) {
  switch (action.type) {
    case 'FETCH_REMOTE_RECORDS':
      return queries.concat({ id: JSON.stringify(action.query), promise: action.queryPromise });

    default:
      return queries;
  }
}
