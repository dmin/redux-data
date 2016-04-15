import unionBy from 'lodash.unionby';

export default function (recordsGroupedByType = {}, action) {
  switch (action.type) {
    case 'RECEIVE_REMOTE_RECORDS':
      const existingRecords = recordsGroupedByType[action.target] || [];
      // TODO performance - persistant data structure would be nice here
      return {
        [action.target]: unionBy(action.records, existingRecords, 'id'),
        ...recordsGroupedByType,
      };
    default:
      return recordsGroupedByType;
  }
}

// create (single/multiple)
// update (single/multiple)
// destroy (single/multiple)
