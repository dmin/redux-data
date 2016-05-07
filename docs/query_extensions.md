What does the 'first' transformer do

takes the result of a query and returns the first entry

checks to make sure that the query only finds one record (on both client and server in dev mode)

_______________________


What does the find extension do?

automatically sets the following query attributes:

{
  where: { id: 'id passed to find'},
  transforms: ['first'],
}



  A query property needs to define how to:
    build a selector for the client store
    make a GET request server
    compare itself to other queries for caching

  something needs to know how to turn a command into
   - redux action
   - post request to server
