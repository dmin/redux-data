import test from 'tape';
import selectRecords from '../selectRecords';

// TODO can we use randomized property based testing here?
test('selectRecords', assert => {

  const query = {
    target: 'items',
    select: ['name'],
    limit: 3,
  };

  const recordsGroupedByType = {
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
  };

  const actual = selectRecords(recordsGroupedByType, query);
  const expected = [
    { 'name': 'Receptacle' },
    { 'name': 'Switch' },
    { 'name': 'Bulb' },
  ];

  assert.deepEqual(actual, expected, 'returns the properly filtered/mapped records');
  assert.end();
});
