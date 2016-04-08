// import remoteQuery from './remoteQuery';
import containsQuery from './containsQuery';
import entries from 'object.entries';

/*
  Takes in a schema, returns a store object
*/
export default function locus(/* schema, adapter*/) {
  // let data = {};
  let subscriptions = [];
  // TODO let pendingQueries = [];
  let cachedQueries = [];

  // TODO only subscribe to the types the queries care about (included nested queries)
  // TODO prepare query selectors during idle time
  return {
    subscribe(cb) {
      subscriptions.push(cb);
      cb(); // Invoke callback immediately at time of subscription
      return () => (subscriptions = subscriptions.filter(sub => sub !== cb));
    },

    fetch(queries, update) {
      const promisedQueries = entries(queries).map(([queryName, query]) => {
        // Check if a pending query matches this query
        // if (containsQuery(pendingQueries, query)) {
        //   // Don't do anything, a remote request has already been made
        //   // TODO: find promise for pending query and return
        // }
        if (containsQuery(cachedQueries, query)) {
          // The data requested by this query is already in the store/cache.
          // return Promise.resolve(resolveQuery(data, query));
          return Promise.resolve([{ name: 'cache' }]).then(value => ({ [queryName]: value }));
        }
        else {
          // This query needs to be sent to the server
          // TODO this is where adapters for different backends would go?
          // i.e. RESTful or GraphQL, or other single-endpoint
          // return remoteQuery(query); // TODO must return a promise
          // TODO add query to cached queries / remove from pending
          return Promise.resolve([{ name: 'server' }]).then(value => ({ [queryName]: value }));
        }
      });

      Promise.all(promisedQueries).then(values => {
        const results = values.reduce((_results, value) => {
          return { ..._results, ...value };
        }, {});

        update(null, results); // TODO send errors, if present
      });
    },

    // mutate(command) {
    //
    // }
  };
}


/*
  TODO: merge queries
  TODO: cache queries
   - pending & received
*/
