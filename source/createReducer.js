import queriesReducer from './queriesReducer';
import recordsReducer from './recordsReducer';
import createSchemaReducer from './createSchemaReducer';

const defaultState = {
  queries: [],
  recordsGroupedByType: {},
};

export default function createReducer(schema) {
  const schemaReducer = createSchemaReducer(schema);

  return function reducer(state = defaultState, action) {
    return {
      queries: queriesReducer(state.queries, action),
      recordsGroupedByType: recordsReducer(state.recordsGroupedByType, action),
      schema: schemaReducer(state.schema, action),
    };
  };
}
