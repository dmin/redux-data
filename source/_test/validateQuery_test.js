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

  const actual = validateQuery(validQuery, schemaManager, 'testQuery', 'testComponent');
  assert.true(actual);
  assert.end();
});


test('validateQuery: given a target clause with an invalid collection returns false', assert => {
  const invalidTarget = {
    target: 'invalidCollection',
  };

  const actual = validateQuery(invalidTarget, schemaManager, 'testQuery', 'testComponent');
  assert.false(actual);
  assert.end();
});


test('validateQuery: returns true when limit clause value is a number, otherwise false', assert => {
  const validLimit = {
    target: 'items',
    limit: 100,
  };

  const invalidLimit = {
    target: 'items',
    limit: 'not a number',
  };

  assert.true(validateQuery(validLimit, schemaManager, 'testQuery', 'testComponent'));
  assert.false(validateQuery(invalidLimit, schemaManager, 'testQuery', 'testComponent'));
  assert.end();
});


test('validateQuery: returns true when select clause value is an array of valid field names, otherwise false', assert => {
  const validSelect = {
    target: 'items',
    select: ['id', 'name', 'quantity'],
  };

  const invalidSelectType = {
    target: 'items',
    select: 'not a array',
  };

  const invalidSelectFieldName = {
    target: 'items',
    select: ['not a field in items'],
  };

  assert.true(validateQuery(validSelect, schemaManager, 'testQuery', 'testComponent'));
  assert.false(validateQuery(invalidSelectType, schemaManager, 'testQuery', 'testComponent'));
  assert.false(validateQuery(invalidSelectFieldName, schemaManager, 'testQuery', 'testComponent'));
  assert.end();
});
