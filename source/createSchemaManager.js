// TODO future refactor: a lot of these functions probably are not needed in production.

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

    isCollectionFieldType(collectionName, fieldName, value) {
      if (!this.isCollectionType(collectionName) || !this.isCollectionField(collectionName, fieldName)) {
        return false;
      }

      const fieldDescriptor = (
        _schema[collectionName]
          .fields
          .filter(fd => fd.name === fieldName)[0] // TODO need to validate schema to ensure no duplicate field names
      );

      // TODO dependency: depends on, among other things, that fieldDescriptor is a function (essential the built-in String, or Number functions)
      return fieldDescriptor.type(value) === value;
    }
  }

  return new SchemaManager(schema);
}
