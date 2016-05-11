const unionWith = require('lodash.unionwith');
const find = require('lodash.find');

// TODO if records had uuid from server would not need to check type?
// would need to be an option, don't want to enfore uuids for records
const recordComparator = (a, b) => a._type_ === b._type_ && a.id === b.id;

module.exports = function (records = [], action) {
  switch (action.type) {

    // TODO Create Record

    case 'DATA_RECEIVE_REMOTE_RECORDS': // TODO rename to DATA_CREATE_RECORDS or DATA_ADD_RECORDS
      // TODO performance - persistant data structure would be nice here
      return unionWith(action.records, records, recordComparator);

    case 'DATA_UPDATE_RECORD':
      // TODO need to enforce that data.id is included with update actions
      const record = find(records, { type: action.recordType, id: action.record.id }) || {}; // TODO Would there ever be a circumstance other than an error where the record being updated would not be in the store?
      const updatedRecord = Object.assign({}, record, action.record); // TODO action.record should now be the full updated record, is there any need for this merge?

      return unionWith([updatedRecord], records, recordComparator);

    case 'DATA_DELETE_RECORD':
      // TODO Should we check to make sure the record user is trying to delete is actually in the store? should we still send request to server if its not?
      // Is there ever a time you'd want to delete something through Redux-Data when its not in Redux-Data's record store slice?
      return records.filter(record => record._type_ !== action.target && record.id !== action.data);

    default:
      return records;
  }
};

// TODO create (single/multiple)
// TODO update (multiple)
// TODO destroy (multiple)
