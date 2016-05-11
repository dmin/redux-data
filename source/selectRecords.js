import pipe from 'lodash.flow';
import curry from 'lodash.curry';

import whereSelector from './whereSelector';

// TODO move this to the where function? (avoid looping through records again)
const target = curry(
  (target, records) => records.filter(record => record._type_ === target)
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
  return whereSelector(criteria, records);
});

/*
 TODO transforms are different than other selectors, for instance,
 the 'first' transformer on the client doesn't care about offset or limit
 but when being sent to the server it should always pass a limit of one
 (unless the server understands Redux-Data's 'first' transformer natively)
 See additional note below where transform is curried/invoked
*/
const transform = curry((transformation, records) => {
  // TODO allow more than one transform per query?
  // TODO allow custom transformations, or at least figure out a better way then using conditionals to choose a transformation
  if (transformation === 'first' && records.length > 0) {
    return records[0];
  }
  else if (transformation === 'first' && records.length === 0) {
    // TODO should this be an error? should the first transformer require that are record be found?
    // TODO use null object pattern or a Maybe here?
    return null;
  }
  else {
    return records;
  }
});

// TODO can the result of running this be memoized, and only need to be re-run in the required records actually changed?
// see https://github.com/Day8/re-frame/blob/a4de4651cebc4d298fe86395054a9d9f7c2f5d43/README.md#just-a-read-only-cursor
export default function selectRecords(records, query) {
  return pipe(
    target(query.target),
    where(query.where),
    select(query.select),
    offset(query.offset),
    limit(query.limit),
    transform(query.transform) // TODO where should this be in the chain? Or should it be completely outside the chain, and act on the query as a whole?
  )(records);
}
