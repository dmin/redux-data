import React from 'react';
import { render } from 'react-dom';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import schema from './schema';
import { createReducer } from '../source/index';

import { Provider } from 'react-redux';

import Items from './Items';

// TODO: use a store enhancer to setup reducers, check for name colisions? See discussion at: https://github.com/reactjs/redux/issues/678
const combinedReducer = combineReducers({
  locus: createReducer(schema),
});

let store = createStore(combinedReducer, applyMiddleware(thunk));

render(
  <Provider store={store}>
    <Items />
  </Provider>,
  window.document.getElementById('react')
);
