export default function createSchemaManager(schema) {
  // TODO type check schema?
  let _schema;

  class SchemaManager {
    constructor(schema) {
      _schema = schema;
    }

    isCollectionType(string) {
      if (Object.keys(_schema).indexOf(string) !== -1) {
        return true;
      }
      else {
        return false;
      }
    }

    isCollectionField(collectionName, fieldName) {
      if (!this.isCollectionType(collectionName)) {
        return false;
      }

      const hasField = _schema[collectionName].fields.some(fieldDescriptor => {
        return fieldDescriptor.name === fieldName;
      });

      if (hasField) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  return new SchemaManager(schema);
}
