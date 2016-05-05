# Queries

This page describes the format of query objects. If you haven't already, you might want to read about how to pass query objects to Redux-Data in the [documentation for `connect()`](/docs/connect.md).

## Format
Query objects can have the following properties (these properties are supported by Redux-Data when querying the store, but to use them your adapter and server must also support them.)

```javascript
{
  // Required, type of records this query should return.
  target: 'items',

  /*
    Optional, acts as a filter for records. The follow where clause can
    be read as: Items where the name includes 'Breaker' and has a
    quantity of 10.
  */
  where: {
    name: {
      like: 'Breaker'
    },
    quantity: {
      equal: 10
    }
  },

  // Optional, useful for pagination
  offset: 0,

  // Optional, useful for pagination
  limit: 10,

  /*
    Optional, used to change the format of the result.
    Currently the only option is 'first', which returns
    the first result of the query as a single object
    (instead of an array).
  */
  transform: 'first',
}
```
