import pipe from 'lodash.flow';
import curry from 'lodash.curry';

const target = curry(
  (target, recordsGroupedByType) => recordsGroupedByType[target]
);

const select = curry((selectedFields, records) => (
  records.map(record => {
    return selectedFields.reduce((fields, fieldName) => {
      return { [fieldName]: record[fieldName], ...fields };
    }, {});
  })
));

const limit = curry((limit, records) => records.slice(0, limit));

export default function selectRecords(recordsGroupedByType, query) {
  return pipe(
    target(query.target),
    select(query.select),
    limit(query.limit)
  )(recordsGroupedByType);
}
