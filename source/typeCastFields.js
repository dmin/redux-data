import find from 'lodash.find';

export default function typeCastFields(schema, target, suppliedFields) {
  // TODO verify field is an object.
  // TODO extract finding the schemaFields to outside this function
  const schemaFields = schema[target].fields;

  if (__DEV__) { // TODO requires a __DEV__ global - set by webpack, what about during unit testing?
    // TODO is this the best way?
    var warnings = {};
  }

  const fields = Object.entries(suppliedFields).reduce((typeCastFields, [fieldName, fieldValue]) => {
    const schemaField = find(schemaFields, { name: fieldName });
    if (!schemaField) { // TODO only in dev
      // TODO better way?
      // TODO it would be nice to know if they was happening on data from server / form field / etc

      if (__DEV__) {
        warnings[target] = `The "${target}" collection does not have a the field "${fieldName}" specified in the schema. Cannot perform type cast.`;
      }

      return {
        ...typeCastFields,
        [fieldName]: fieldValue,
      };
    }
    return {
      ...typeCastFields,
      [fieldName]: schemaField.type(fieldValue),
    };
  }, {});

  if (__DEV__) {
    Object.entries(warnings).forEach(([key, value]) => {
      console.warn(value);
    });
  }

  return fields;
}
