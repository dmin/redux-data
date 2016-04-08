import React from 'react';

import prepareQueries from './prepareQueries';

export default function connect(Component, queries) {
  class LocusConnect extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = {};
      this.loading = true;
      this.error = false;
      this.store = context.store;

      /*
        TODO: if commands also have attached queries, when should they
        subscribe to the store?
        TODO: somehow mark queries if they have sent a request to a remote store, so they don't have to be checked against previous queries again
        TODO: can the store somehow prepare and return 'selector' functions so instead
        of having to check if the query has already been cached it can just run the selector

          TODO use a subscription object that returns a set of selectors to run
          when data is needed from the store, when props change the subscription can be updated.
        */
      this.unsubscribe = this.store.subscribe(
        () => this.fetch(props)
      );
    }

    fetch(props) {
      this.store.fetch(
        prepareQueries(queries, props),
        (error, results) => (
          this.loading = false,
          this.error = error,
          this.setState(results)
        )
      );
    }

    componentWillUnmount() {
      // TODO is there a possibility of an error here? Need to try/catch? use a Error Monad?
      this.unsubscribe();
    }

    // TODO should component update

    componentWillReceiveProps(nextProps) {
      // TODO prepare queries applies props to queries,
      // another possible optimization would be to create selector functions for the queries
      // TODO if query does not depend on props won't need to do this.
      // TODO would a deepEquals here be more efficient than running the queries again?
      // TODO if we assume props were immutable data structures we could do a very fast equality check here
      this.fetch(nextProps);
    }

    render() {
      if (this.loading) {
        // TODO allow custom loading component
        return <div>Loading data...</div>;
      }
      else if (this.error) {
        // TODO allow custom error component
        // TODO retry functionality? automatic? manual?
        return <div>There was an error loading...</div>;
      }
      else {
        // TODO: check for props that conflict with data attributes
        return <Component {...this.state} {...this.props} />;
      }
    }
  }

  LocusConnect.contextTypes = {
    store: React.PropTypes.object.isRequired, // TODO better validation
  };

  return LocusConnect;
}
