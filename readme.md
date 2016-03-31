# Locus
You declare the data your application uses, Locus takes care of the rest.

## Install

```
npm install @locus/locus --save
```

## What is locus?
Locus is a library that helps with:
 - describing what data and mutations your application uses.
 - fetching data from server
 - caching data
 - helping with form submissions
 - waiting for multiple data requests to finish
 - prefetch data (like chrome prefetches stuff)
 - precompile queries/commands (also remove code that would do that at runtime)
 - try to automatically detect n+1 queries
 - static analysis of queries/types (eslint plugin)
 - form objects (actions (queries?)) against multiple types (fake type)
 - form handling (like redux-form)


## Usage
Basic usage with React (see below for usage with React Router).
```javascript
/* index.js */
import React from 'react';
import { render } from 'react-dom';

import Provider from '@locus/locus/Provider';

import Items from './Items';

render(
  <Provider store={store}>
    <Items />
  </Provider>
  window.document.getElementById('#react')
)
```

```javascript
/* Items.js */
import React from 'react';
import connect from '@locus/locus/connect';

const Items = ({items}) => (
  <ul>
    {items.map((item, i) => <li key={i}>{item.name}</li>)}
  </ul>
);

export default connect(Items, {
  items(locus, props) => locus.query({
    target: 'Items',
    select: ['name'],
    limit: 10,
  }),

  createItem(locus) => locus.command({
    target: 'Items',
    action: 'create',
  }),
});
```

```javascript
/* schema.js */
export default {
  baseUrl: http://localhost:3000,

  Items: {
    fields: [
      { id: String }, // by default id not allowed when updating/creating
      { name: String },
    ],

    // create/update/destroy automatically created
    // action: [
    //   { create: false },
    //   { toggle: something => 'do something'}
    // ]
  }
}
```


## Why?
Fetching (and mutating) data stored on a server is one of the most common aspects of front end JavaScript application development. For all the recent improvements and innovations in JavaScript libraries and frameworks, it has still been much too difficult to get data to and from a server. Data fetching (and mutation) doesn't need to feel like the imperative, manual labor intensive, and somewhat hackish task that it has historically been.

Locus aims to change the status quo.


## Getting Started
- Vanilla JS
- Redux / React
- With react-router
- Vanilla React
- Ember
- Angular


## Other Libraries (and Philosophies) and Why Locus is Different
 - Relay
 - Falcor
 - Ember Data / JSON API
 - REST
 - react-command-query
 - react-refetch
