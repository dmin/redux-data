export default function createSchemaReducer(schema) {
  return function schemaReducer(state = schema, _action) {
    // The schema state is read only. Used to pass the schema to
    // connected components.
    return state;
  };
}
