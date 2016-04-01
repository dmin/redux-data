import React from 'react';

import _prepareQueries from './prepareQueries';

export default function connect(
  Component,
  {
    queries,
    prepareQueries = _prepareQueries,
}) {
  class LocusConnect extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { loading: true };
      this.loading = true;
      this.error = false;
      this.store = context.store;

      /*
        TODO: if commands also have attached queries, when should they
        subscribe to the store?
      */
      /*
        When the subscription is created/updated the queries are resolved
      */
      this.subscription = this.store.subscribe({
        queries: prepareQueries(queries),
        onChange: state => (this.setState({ state }), this.loading = false),
        onError: error => (this.error = error),
      });
    }

    componentWillUnmount() {
      this.subscription.cancel();
    }

    // TODO should component update

    componentWillReceiveProps(nextProps) {
      // TODO prepare queries applies props to queries,
      // another possible optimization would be to create selector functions for the queries
      // TODO if query does not depend on props won't need to do this.
      // TODO would a deepEquals here be more efficient than running the queries again?
      this.subscription.update({
        queries: prepareQueries(queries, nextProps),
      });
    }

    render() {
      if (this.loading) {
        // TODO allow custom loading component
        return <div>Loading data...</div>;
      }
      else if (this.error) {
        // TODO allow custom error component
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
