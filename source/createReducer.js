import queriesReducer from './queriesReducer';
import recordsReducer from './recordsReducer';
import createSchemaReducer from './createSchemaReducer';

const defaultState = {
  queries: [],
  recordsGroupedByType: {},
};

export default function createReducer(schema, adapter) {

  schema.$adapter = adapter;

  const schemaReducer = createSchemaReducer(schema);

  return function reducer(state = defaultState, action) {
    return {
      queries: queriesReducer(state.queries, action),
      records: recordsReducer(state.records, action),
      schema: schemaReducer(state.schema, action),
    };
  };
}
