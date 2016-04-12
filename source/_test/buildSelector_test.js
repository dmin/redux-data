const test = require('tape');
const buildSelector = require('../buildSelector');

test('buildSelector', assert => {
  const queries = { query1: 'FAKE1', query2: 'FAKE2' };
  const recordsProperty = 'FAKE3';
  const selectRecords = (groupedRecords, query) => `${groupedRecords}-${query}`;

  const state = {
    'FAKE3': 'FAKE4',
  };

  const selector = buildSelector(queries, recordsProperty, selectRecords);

  const actual = selector(state);
  const expected = {
    query1: 'FAKE4-FAKE1',
    query2: 'FAKE4-FAKE2',
  };

  assert.deepEqual(actual, expected, 'returns results of queries in correct shape');
  assert.end();
});

// TODO can we use randomized property based testing here?
test('buildSelector', assert => {

  const queries = {
    items: {
      target: 'items',
      select: ['name'],
      limit: 3,
    },
  };

  const selector = buildSelector(queries, '_locus_records');

  const state = {
    _locus_records: {
      items: [{
        'id': 1,
        'name': 'Receptacle',
        'quantity': 10,
      }, {
        'id': 2,
        'name': 'Switch',
        'quantity': 10,
      }, {
        'id': 3,
        'name': 'Bulb',
        'quantity': 10,
      }, {
        'id': 4,
        'name': 'Plate',
        'quantity': 10,
      }, {
        'id': 5,
        'name': 'Cord',
        'quantity': 10,
      }],
    },
  };

  const actual = selector(state);
  const expected = {
    items: [
      { 'name': 'Receptacle' },
      { 'name': 'Switch' },
      { 'name': 'Bulb' },
    ],
  };


  assert.deepEqual(actual, expected, 'returns the properly filtered/mapped records');
  // pass in queries

  // it returns a function that, when applied to a state object with
  // _locus_records, returns a list of records matching the queries in
  // the shape requested by the queries

  assert.end();
});
