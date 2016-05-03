import find from 'lodash.find';

export default function typeCastFields(schema, target, suppliedFields) {
  // TODO verify field is an object.
  // TODO extract finding the schemaFields to outside this function
  const schemaFields = schema[target].fields;

  if (process.env.NODE_ENV !== 'production') { // TODO this is somehow being set in the browser, webpack?
    // TODO is this the best way?
    var warnings = {};
  }

  const fields = Object.entries(suppliedFields).reduce((typeCastFields, [fieldName, fieldValue]) => {
    const schemaField = find(schemaFields, { name: fieldName });

    // TODO if schema validation requires that all fields have a type defined then this check won't be necessary.
    if (process.env.NODE_ENV !== 'production') {
      if (!schemaField) {
        // TODO list the command or query where this originated.
        warnings[fieldName] = `REDUX-DATA: The "${target}" collection does not have the field "${fieldName}" specified in the schema. Cannot perform type cast.`;
      }
    }

    // TODO if schema validation requires that all fields have a type defined then !schemaField check won't be necessary
    // TODO How would Boolean false values be handled here?
    // TODO Should schema define which fields are allow to be null?
    // If the fieldValue is null/undefined don't perform type cast.
    if (!fieldValue || !schemaField) {
      return {
        ...typeCastFields,
        [fieldName]: fieldValue,
      };
    }
    else {
      return {
        ...typeCastFields,
        [fieldName]: schemaField.type(fieldValue),
      };
    }
  }, {});

  if (process.env.NODE_ENV !== 'production') {
    Object.entries(warnings).forEach(([_key, value]) => {
      console.warn(value);
    });
  }

  return fields;
}
