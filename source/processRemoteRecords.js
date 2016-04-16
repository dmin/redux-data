export default function processRemoteRecords(
  recordsPromise,
  collectionName,
  fieldNames
) {
  return recordsPromise
    .then(responseBody => responseBody[collectionName])
    .then(records => (
      records.map(record => {
        // TODO how inefficient is this? time/space?
        // can a function be created at build time to do this efficiently?
        // would it be more efficient to create a new key and delete the old key, mutating the object?
        // best would be to make sure the server returns proper field names and there is an option to turn this off (and remove from build?)

        // TODO promises swallow errors, for instance, if fieldNames is undefined
        // it should cause an error, but nothing throws, and the promise doesn't run
        // the catch at the end of the chain either.
        return Object.entries(record).reduce((renamed, [key, value]) => {
          // TODO what if one of these options, like fields, doesn't exist?
          if (fieldNames[key]) {
            return { [fieldNames[key]]: value, ...renamed };
          }
          else {
            return { [key]: value, ...renamed };
          }
        }, {});
      })
    ));
}
