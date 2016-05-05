export const conditionTypes = {
  equal: (recordValue, conditionValue) => recordValue === conditionValue,

  // TODO how will this work for types other than strings - what if custom types are allowed?
  match: (recordValue, conditionValue) => conditionValue.test(recordValue),
};


export default function whereSelector(criteria = {}, records) {

  // TODO validate where clauses - should validation take place 'just in time'
  // inline in this function? If so, will type information from the schema
  // be needed?

  // TODO support OR statements

  // TODO what is the time complexity of this function? Is there a non-obscure way to make it faster? Is is even a bottleneck?


  return records.filter(record => {

    return Object.entries(criteria).every(([field, conditions]) => {

      // TODO Handle this case with a 'query extension' that translates the query into a standard format before it gets here
      if (typeof conditions !== 'object') {
        return conditionTypes.equal(record[field], conditions);
      }

      return Object.entries(conditions).every(([name, value]) => {
        // TODO assert valid condition type
        return conditionTypes[name](record[field], value);

      });

    });

  });
}
