import test from 'tape';

import createSchemaManager from '../createSchemaManager';
import schema from './support/testSchema';

test('createSchemaManager: creates a SchemaManager instance with given schema', assert => {

  const schemaManager = createSchemaManager(schema);

  const actual = schemaManager.constructor.name;
  const expected = 'SchemaManager';

  assert.equal(actual, expected);

  assert.end();
});

test('SchemaManager#isCollectionType returns true if the given string matches the name of a collection in the schema, otherwise returns false', assert => {

  const schemaManager = createSchemaManager(schema);

  assert.true(schemaManager.isCollectionType('items'));
  assert.false(schemaManager.isCollectionType('notARealCollection'));
  assert.end();
});
