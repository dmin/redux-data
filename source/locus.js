import remoteQuery from './remoteQuery';

/*
  Takes in a schema, returns a store object
*/
export default function locus(schema, adapter) {
  let data = {};
  let subscriptions = new Map();

  // TODO only subscribe to the types the queries care about (included nested queries)
  // TODO prepare query selectors during idle time
  return {
    subscribe({ queries, onChange, onError }) {
      const subscription = {
        cancel() {
          subscriptions.delete(this);
        },

        update({ queries }) {
          // TODO document that it only allows updating quries (DEV error)
          this.queries = queries;
        },

        queries, onChange, onError,
      };

      subscriptions.set(subscription);

      // Run queries when the a subscription is created.
      adapter.fetch(queries, onChange, onError);

      return subscription;
    },
  };
}


/*
  TODO: merge queries
  TODO: cache queries
   - pending & received
*/
