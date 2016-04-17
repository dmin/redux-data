import pipe from 'lodash.flow';
import curry from 'lodash.curry';
import filter from 'lodash.filter';

const target = curry(
  (target, recordsGroupedByType) => recordsGroupedByType[target]
);

const select = curry((selectedFields, records) => {
  if (!selectedFields) {
    return records;
  }

  return records.map(record => {
    return selectedFields.reduce((fields, fieldName) => {
      return { [fieldName]: record[fieldName], ...fields };
    }, {});
  });
});

const offset = curry((offset, records) => records.slice(offset));

const limit = curry((limit, records) => records.slice(0, limit));

const where = curry((criteria, records) => {
  // TODO currently only supports equality checks (conditions? criterion? test?)
  return filter(records, criteria);
});

// TODO can the result of running this be memoized, and only need to be re-run in the required records actually changed?
// see https://github.com/Day8/re-frame/blob/a4de4651cebc4d298fe86395054a9d9f7c2f5d43/README.md#just-a-read-only-cursor
export default function selectRecords(recordsGroupedByType, query) {
  return pipe(
    target(query.target),
    where(query.where),
    select(query.select),
    offset(query.offset),
    limit(query.limit)
  )(recordsGroupedByType);
}
