import entries from 'object.entries';

import _selectRecords from './selectRecords';

export default function buildSelector(
  queries,
  recordsObject,
  selectRecords = _selectRecords
) {
  return state => {
    return entries(queries).reduce((namedSelectors, [queryName, query]) => {
      return { [queryName]: selectRecords(state[recordsObject], query), ...namedSelectors };
    }, {});
  };
}
