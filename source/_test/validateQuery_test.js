import test from 'tape';

import validateQuery from '../validateQuery';
import schema from './support/testSchema';
import createSchemaManager from '../createSchemaManager';

// TODO future refactor: it might be better if this test didn't rely on a real schemaManager.
const schemaManager = createSchemaManager(schema);

test('validateQuery: given only a target clause, returns true', assert => {
  const validQuery = {
    target: 'items',
    // TODO test that no limit clause warns?
    // TODO limit clause might be required?
  };

  const actual = validateQuery(validQuery, schemaManager);
  assert.true(actual);
  assert.end();
});


test('validateQuery: given a target clause with an invalid collection returns false', assert => {
  const invalidTarget = {
    target: 'invalidCollection',
  };

  const actual = validateQuery(invalidTarget, schemaManager);
  assert.false(actual);
  assert.end();
});


test('validateQuery: given an invalid limit clause returns false', assert => {
  const invalidLimit = {
    target: 'items',
    limit: 'not a number',
  };

  const actual = validateQuery(invalidLimit, schemaManager);
  assert.false(actual);
  assert.end();
});
