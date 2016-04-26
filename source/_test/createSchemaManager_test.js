import test from 'tape';

import createSchemaManager from '../createSchemaManager';
import schema from './support/testSchema';

const schemaManager = createSchemaManager(schema);

test('createSchemaManager: creates a SchemaManager instance with given schema', assert => {
  const actual = schemaManager.constructor.name;
  const expected = 'SchemaManager';

  assert.equal(actual, expected);
  assert.end();
});

test('SchemaManager#isCollectionType returns true if the given string matches the name of a collection in the schema, otherwise returns false', assert => {
  assert.true(schemaManager.isCollectionType('items'));
  assert.false(schemaManager.isCollectionType('notARealCollection'));
  assert.end();
});


test('SchemaManager#isCollectionField returns true if the given string matches the name of a field for the given collection in the schema, otherwise returns false', assert => {
  assert.true(schemaManager.isCollectionField('items', 'name'));
  assert.false(schemaManager.isCollectionField('items', 'not a real field'));
  assert.false(schemaManager.isCollectionField('not a real collection', 'not a real field'));
  assert.end();
});


test('SchemaManager#isCollectionFieldType returns true if the given value matches the type of the given field for the given collection in the schema, otherwise returns false', assert => {
  assert.true(schemaManager.isCollectionFieldType('items', 'name', 'David'), 'valid type');
  assert.false(schemaManager.isCollectionFieldType('items', 'name', 1), 'invalid type');
  assert.end();
});
