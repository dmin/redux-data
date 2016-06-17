const test = require('tape');
const createQueryGroupSelector = require('../createQueryGroupSelector');

test('createQueryGroupSelector', assert => {
  const queries = { query1: 'FAKE1', query2: 'FAKE2' };
  const recordsProperty = 'FAKE3';
  const selectRecords = (groupedRecords, query) => `${groupedRecords}-${query}`;

  const state = {
    'FAKE3': 'FAKE4',
  };

  const selector = createQueryGroupSelector(queries, recordsProperty, selectRecords);

  const actual = selector(state);
  const expected = {
    query1: 'FAKE4-FAKE1',
    query2: 'FAKE4-FAKE2',
  };

  assert.deepEqual(actual, expected, 'returns results of queries in correct shape');
  assert.end();
});
