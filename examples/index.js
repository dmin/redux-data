import React from 'react';
import { render } from 'react-dom';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// TODO relocate/automate adding these
import schema from './schema';
import createSchemaReducer from '../source/createSchemaReducer';
const schemaReducer = createSchemaReducer(schema);
import locusQueriesReducer from '../source/locusQueriesReducer';
import locusRecordsReducer from '../source/locusRecordsReducer';

import { Provider } from 'react-redux';
import Items from './Items';

const reducers = {
  _locus_queries: locusQueriesReducer,
  _locus_records: locusRecordsReducer,
  _locus_schema: schemaReducer,
};

const combinedReducer = combineReducers(reducers);

let store = createStore(combinedReducer, applyMiddleware(thunk));

render(
  <Provider store={store}>
    <Items />
  </Provider>,
  window.document.getElementById('react')
);
