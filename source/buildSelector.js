import entries from 'object.entries';
import pipe from 'lodash.flow';
import curry from 'lodash.curry';


export default function buildSelector(queries) {
  return state => {
    return entries(queries).reduce((namedSelectors, [queryName, query]) => {
      return { [queryName]: selectRecords(state, query), ...namedSelectors };
    }, {});
  };
}

const target = curry((target, recordGroups) => recordGroups[target]);

const select = curry((selectedFields, records) => (
  records.map(record => {
    return selectedFields.reduce((fields, fieldName) => {
      return { [fieldName]: record[fieldName], ...fields };
    }, {});
  })
));

const limit = curry((limit, records) => records.slice(0, limit));

function selectRecords(state, query) {
  return pipe(
    target(query.target),
    select(query.select),
    limit(query.limit)
  )(state._locus_records);
}
