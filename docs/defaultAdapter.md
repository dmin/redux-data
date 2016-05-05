# Default Adapter

***Since it is impossible to create an adapter that works for every server the goal is for the default adapter to offer sensible defaults while being very easy to customize. Further documentation on this is forthcoming.***

The default adapter that ships with Redux-Data expects to communicate with a server over HTTP that responses to RESTful URLs. In order to accomplish this it expects each record type listed in the schema to override a number of properties, including: `pluralName`, and `singularName`. This is done by setting an `adapter` property under the record type in the schema. For example:

```javascript
// schema.js
import { defaultAdapter } from 'redux-data';
export default {
  $adapter: Object.assign(
    defaultAdapter,
    { baseUrl: '/api' } // You can optionally override the default baseUrl
  ),

  items: {
    adapter: {
      pluralName: 'items',
      singularName: 'item',
    },

    fields: [
      { name: 'id', type: String },
      { name: 'name', type: String },
      { name: 'quantity', type: Number },
    ],
  },
};
```

## Queries
Conceptually, the default adapter builds URLs for queries like so:

```javascript
`${baseUrl}/${pluralName}?${query}`
```

For example, the following query:
```javascript
{
  target: 'items',
  where: {
    quantity: {
      equal: 3,
    }
  },
  limit: 10,
}
```

Would produce the following request:
- method: GET
- URL: `/api/items?query[where][quantity][equal]=3&query[limit]=10`

## Commands

### Create
Conceptually, the default adapter builds URLs for create commands like so:

```javascript
`${baseUrl}/${pluralName}`
```

For example, the following command:
```javascript
{
  createItem: props => ({
    target: 'items',
    action: 'create',
  })
}
```

When invoked as follows:
```javascript
createItem({ name: 'Pencil', quantity: 4 })
```

Would produce the following request:
- method: POST
- URL: `/api/items`
- body: { item: { name: 'Pencil', quantity: 4 } }

### Update
Conceptually, the default adapter builds URLs for update commands like so:

```javascript
`${baseUrl}/${pluralName}/${id}`
```

For example, the following command:
```javascript
{
  updateItem: props => ({
    target: 'items',
    action: 'update',
  })
}
```

When invoked as follows:
```javascript
updateItem({ id: '10', quantity: 5 })
```

Would produce the following request:
- method: POST
- headers: {
  X-Http-Method-Override: 'PATCH'
}
- URL: `/api/items/10`
- body: { item: { quantity: 5 } }

### Delete
Conceptually, the default adapter builds URLs for delete commands like so:

```javascript
`${baseUrl}/${pluralName}/${id}`
```

For example, the following command:
```javascript
{
  deleteItem: props => ({
    target: 'items',
    action: 'delete',
  })
}
```

When invoked as follows:
```javascript
deleteItem(10)
```

Would produce the following request:
- method: POST
- headers: {
  X-Http-Method-Override: 'DELETE'
}
- URL: `/api/items/10`
