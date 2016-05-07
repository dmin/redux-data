# DEV NOTES

## Steps for changing/adding query syntax:
 - update code that creates selectors for redux store
 - update how the cache is checked, if needed
 - update how new syntax is made into a server request
TODO: can this be turned into a data structure to make it more obvious in the code?



# Server Requests
What does making a server request for a query look like?
- Build a url from query
 - need information about the server and what it's abilities are
- make request to server
- wait for response
- parse response
- dispatch action to put records in store (redux specific)

# Caching Strategies

## Query Comparison
Given a query, run a deep equality check against all previously resolved queries.

## URL Comparison
Given a query, construct a URL. Compare that url to all previously requested urls


# Two Types of Queries
Standard:
```javascript
{
  collection: 'items',
  where: { id: 7 },
} // Returns [{ id: 7, name: 'Box'}]
```

Transformed (using 'first' transformer):
```javascript
{
  collection: 'items',
  find: 7,
} // returns { id: 7, name: 'Box'} (no wrapping array)
/*
  When using find no other query options are allowed (just warn)

  Need to define Redux-Data's expectations about an 'id' field on each record
   - expects it to be named 'id' (configurable)
   - type casts to a String
*/

```


# Describe why Redux-Data must use setState for connected components instead of re-rendering from the top down on a state change
Since components closer to the root of the tree do not know what data descendent components are using, so they can't implement a shouldCompoentUpdate function (if could never return false since they could never know if a descendent needed to update.)

# Describe performance issues with having a connected component as a child of another connected component
?


# Queries
Queries are turned into two things:
 - selector which returns data from the store in the shape requested by the query.
 - request to server for all records needed to fulfill the query, not in shape requested by the server ?? - may be sometimes, for instance if the 'select' selector is used the server may not return all fields, on the other hand it might fetch all the fields so they are in the cache - this should be
