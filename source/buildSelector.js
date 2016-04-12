import entries from 'object.entries';


export default function buildSelector(queries) {
  return state => {
    return entries(queries).reduce((namedSelectors, [queryName, query]) => {
      return { [queryName]: selectRecords(state, query), ...namedSelectors };
    }, {});
  };
}

// TODO use compose
function selectRecords(state, query) {
  var targetRecords = state._locus_records[query.target]; // TODO knowledge of state structure

  var selectedFieldsOfRecords = targetRecords.map(record => {
    return query.select.reduce((fields, fieldName) => {
      return { [fieldName]: record[fieldName], ...fields };
    }, {});
  });

  var limit = selectedFieldsOfRecords.slice(0, query.limit);

  return limit;
}
