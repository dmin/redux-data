import React from 'react';
import { render } from 'react-dom';

import { createStore, combineReducers } from 'redux';

import schema from './schema';
import { createReducer, defaultAdapter } from '../source/index';

import { Provider } from 'react-redux';

import Items from './Items';

const appAdapter = Object.assign({}, defaultAdapter, { format: 'json' });

// TODO: use a store enhancer to setup reducers, check for name colisions? See discussion at: https://github.com/reactjs/redux/issues/678
const combinedReducer = combineReducers({
  _data_: createReducer(schema, appAdapter),
});

const store = createStore(combinedReducer);

render(
  <Provider store={store}>
    <Items />
  </Provider>,
  window.document.getElementById('react')
);
