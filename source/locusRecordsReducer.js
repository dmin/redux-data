export default function (recordsGroupedByType = {}, action) {
  switch (action.type) {
    case 'RECEIVE_REMOTE_RECORDS':
      // TODO more sophisticated merging
      // TODO performance - persistant data structure would be nice here
      return { [action.target]: action.records, ...recordsGroupedByType };
    default:
      return recordsGroupedByType;
  }
}
