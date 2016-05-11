***Note: Redux-Data should currently be considered an early "technical preview". API churn and numerous breaking changes should be expected before reaching a 1.0 release.***

# Redux-Data
Redux-Data is a companion to Redux that allows you to declare the data (i.e. records from your server) that your application uses. Redux-Data helps you query and cache data as well as perform mutations on the data.

For a quick look at what Redux-Data can do take a look at the [usage](#usage) section below.

## Installation / Config
These installation instructions assume that you have previously setup Redux and React-Redux and/or have a basic understanding of how to use them. If you're already using Redux it's easy to incrementally add Redux-Data to your application.

### Dependencies
First, install the required peer dependencies, if you don't already have them installed, as well as Redux-Data.

```bash
npm install --save react redux react-redux redux-data

# If you're following along with our example installation you'll also need
# react-dom
npm install --save react-dom
```
Note: Redux-Data currently has a tight coupling with React and React-Redux. In the future this coupling will be severed and it should be possible to use Redux-Data anywhere you use Redux (i.e. without React). React Native is not currently supported, but again, should be in the future.

### Setup
Next, configure Redux and Redux-Data as follows:
```javascript
// index.js

import React from 'react';
import { render } from 'react-dom';

import { createStore, combineReducers } from 'redux';

import schema from './schema'; // See instructions below
import { createReducer, defaultAdapter } from 'redux-data';

import { Provider } from 'react-redux';

import Items from './Items'; // A react component class / function

const combinedReducer = combineReducers({

  // -- Your other reducers here --

  // It's important that you use '_data_' as the property name
  _data_: createReducer(schema, defaultAdapter),
});

const store = createStore(combinedReducer);

render(
  <Provider store={store}>
    <Items />
  </Provider>,
  window.document.getElementById('#root')
);
```

### Schema
Your schema tells Redux-Data the types of records your application uses, as well as information about how to fetch and mutate those records located on your server.

A Redux-Data schema is simply an object. Each property of the schema object is the name of a record type, and the corresponding value provides information about the record type. The special `$adapter` property of the schema identifies the application wide default adapter (more information on adapters in a moment). The schema for our example installation is as follows:

```javascript
// schema.js

import { defaultAdapter } from 'redux-data';
export default {
  $adapter: defaultAdapter, // tells Redux-Data how to talk to your server

  items: { // type of record (this is the name you'll use in queries)
    adapter: { // each record type can override the default adapter
      pluralName: 'items',
      singularName: 'item',
    },

    fields: [ // tells Redux-Data about the fields of this record type
      /*
        Each item of the array should be an object with two properties:
        - 'name' is the name of the field.
        - 'type' is the field's data type, currently on String and Number
        are supported.
      */
      { name: 'id', type: String },
      { name: 'name', type: String },
      { name: 'quantity', type: Number },
    ],
  },
};
```

A word about adapters: Redux-Data attempts to be agnostic about communication with your server - it allows custom adapters to be built to suit whatever style of API your application uses. Currently the only adapter that ships with React-Data is the default adapter which essentially expects to communicate with a server through REST style URLs. Please see the [default adapter documentation](/docs/defaultAdapter.md) for more information.

More information about implementing custom adapters is forth coming.

## Usage

### Queries
Redux-Data interfaces with your React components in a way users of React-Redux will be familiar with. In fact, Redux-Data uses React-Redux under the hood, and if you need it, you can completely customize how React-Redux's version of the `connect` function is invoked. Here is a simple example of querying data for a component:

```javascript
import React from 'react';
import { connect } from 'redux-data';

const Items = ({ items }) => {
  /*
    The items variable will be automatically injected into props by
    Redux-Data based on the query below. It will be an array (with
    a length of no more than three) of "item" objects which have name
    fields that include 'Breaker'. If this query has not already been
    stored in the cache, they Redux-Data will instruct the adapter to
    fetch it from the server.
  */
  return (
    <ul>
      {items.map((item, i) => <li key={i}>{item.name}</li>)}
    </ul>
  );
};

Items.propTypes = {
  items: React.PropTypes.array.isRequired,
};

export default connect(Items, {
  queries: {
    items: props => ({
      target: 'items',
      where: {
        name: { like: 'Breaker' },
      },
      limit: 3,
    }),
  },
});
```

### Commands
Commands allow you to tell Redux-Data how to perform mutations on your data. The mutations are performed on the data in the local store, and the adapter instructs the server to make the same changes. Currently Redux-Data waits for a success response from the server before making the changes on the client (optimistic updating is on the road map).

```javascript
import React from 'react';
import { connect } from 'redux-data';

/*
  You don't need to use react-router, this is just to demonstrate a
  feature below.
*/
import { browserHistory } from 'react-router';


function handleSubmit(event, updateItem) {
  event.preventDefault();
  const value = event.target.querySelector('input[name=name]').value;
  const id = event.target.querySelector('input[name=id]').value;
  updateItem({ name: value, id });
}

/*
  Redux-Data injects a function into props for each command, in this case
  updateItem, which is declared in the call to connect below. updateItem
  expects an object representing fields of an item object.
*/
function EditItem({ item, updateItem }) {
  return (
    <form onSubmit={event => handleSubmit(event, updateItem)}>
      <input type='text' name='name' defaultValue={item.name} />
      <input type='hidden' name='id' value={item.id} />
      <input type='submit' name='Submit' />
    </form>
  );
}

export default connect(EditItem, {
  commands: {
    updateItem: props => ({
      target: 'items',
      action: 'update',
      /*
        The 'then' clause for commands allows you to execute code after
        a successful command, here react-router's route is being
        updated.
      */
      then: updatedItem => browserHistory.push('/items'),
    }),
  },

  queries: {
    item: props => ({
      target: 'categories',
      // props.params.id
      where: { id: props.params.id },
      transform: 'first',
    }),
  },
});
```
For more information see the documentation for [`connect()`](/docs/connect.md), [commands](/docs/commands.md), and [queries](/docs/queries.md).
