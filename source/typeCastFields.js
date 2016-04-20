import find from 'lodash.find';

export default function typeCastFields(schema, target, suppliedFields) {
  // TODO verify field is an object.
  // TODO extract finding the schemaFields to outside this function
  const schemaFields = schema[target].fields;

  return Object.entries(suppliedFields).reduce((typeCastFields, [fieldName, fieldValue]) => {
    const schemaField = find(schemaFields, { name: fieldName });
    if (!schemaField) {
      throw new Error(`${fieldName} is not a valid field for ${target}`);
    }
    return {
      ...typeCastFields,
      [fieldName]: schemaField.type(fieldValue),
    };
  }, {});
}
