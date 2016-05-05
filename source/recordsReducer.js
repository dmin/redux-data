import unionBy from 'lodash.unionby';
import find from 'lodash.find';

// TODO make a sub-reducer so cases don't need to know the structure of recordsGroupedByType?
export default function (recordsGroupedByType = {}, action) {
  switch (action.type) {

    case 'DATA_RECEIVE_REMOTE_RECORDS':
      // TODO performance - persistant data structure would be nice here
      return {
        ...recordsGroupedByType,
        [action.target]: unionBy(action.records, recordsGroupedByType[action.target] || [], 'id'),
      };

    case 'DATA_UPDATE_RECORD':
      const records = recordsGroupedByType[action.target] || [];
      // TODO need to enforce that data.id is included with update actions
      const record = find(records, { id: action.data.id }) || {}; // TODO extract typecasting to somewhere else // TODO Would there ever be a circumstance other than an error where the record being updated would not be in the cache?
      const updatedRecord = { ...record, ...action.data, id: action.data.id }; // TODO extract typecasting to somewhere else

      return {
        ...recordsGroupedByType,
        [action.target]: unionBy([updatedRecord], records, 'id'),
      };

    case 'DATA_DELETE_RECORD':
      // TODO I'm using || [] here because I'm not yet fetching some data through Redux-Data, so its not there when being deleted
      // Should this be a problem in the wild? should we check to make sure the file your trying to delete is actually in the store? should we still send request to server if its not?
      // Is there ever a time you'd want to delete something through Redux-Data when its not in Redux-Data's record store slice?
      const dRecords = recordsGroupedByType[action.target] || [];
      return {
        ...recordsGroupedByType,
        // TODO need to make sure id (and other fields) are the correct data type. Rather not do that everywhere they need to be compared
        [action.target]: dRecords.filter(record => record.id !== action.data),
      };

    default:
      return recordsGroupedByType;
  }
}

// create (single/multiple)
// update (single/multiple)
// destroy (single/multiple)
