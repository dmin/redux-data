import test from 'tape';

import typeCastFields from '../typeCastFields';
import testSchema from './support/testSchema';


test('typeCastFields should type cast fields according to a schema', assert => {

  const target = 'items'; // collection name (items is is test schema)
  const suppliedFields = { id: 2, quantity: '4' };

  const actual = typeCastFields(testSchema, target, suppliedFields);
  const expected = { id: '2', quantity: 4 };

  assert.deepEqual(actual, expected, 'returns the type cast fields');
  assert.end();
});
