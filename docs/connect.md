# `connect()`

Redux-Data interfaces with your components in a way that is very similar to React-Redux. Redux-Data exports a function, `connect`, which accepts a React component class, and a list of operations and creates a 'higher-order component'. This higher order component is simply a react component which manages fetching a mutating data and then renders your component. Lets say you have a component, `Items`, which expects an array of `items` and a `deleteItem` function to be passed in as part of the `props` object.

```javascript
// Items.js (without Redux-Data)
import React from 'react';
import { connect } from 'redux-data';

// Without Redux-Data you would need to manually pass in these props
export default ({ items, deleteItem }) => (
  <ul>
    {items.map((item, i) =>
      <li key={i} onClick={() => deleteItem(item.id)}>{item.name}</li>
    )}
  </ul>
);
```

When you declare a command and/or query (i.e. an operation) with Redux-Data your component will receive a prop under the same name as the key you use to describe the operation. For the component above, we need to pass in the result of a query as `items`.

```javascript
// Items.js (with Redux-Data)
import React from 'react';
import { connect } from 'redux-data';

// With Redux-Data these props are 'injected' for you.
const Items = ({ items, deleteItem }) => (
  <ul>
    {items.map((item, i) =>
      <li key={i} onClick={() => deleteItem(item.id)}>{item.name}</li>
    )}
  </ul>
);

export default connect(Items, {
  /*
    Each property you list under queries is expected to be a function
    that returns a query object. This function will be passed a single
    argument: props, which will contain any props passed in to the connect
    Items component.
  */
  queries: {
    items: props => ({
      target: 'items',
      limit: 10,
    }),
  },

  /*
    Each property you list under commands is expected to be a function
    that returns a command object. This function will be passed a single
    argument: props, which will contain any props passed in to the connect
    Items component.
  */
  commands: {
    deleteItem: props => ({
      target: 'items',
      action: 'delete',
    }),
  },
});
```

For more information see the documentation for [queries](/docs/queries) and [commands](/docs/commands).
