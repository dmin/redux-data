/*
  TODO: need to validate queries against schema
  TODO: prevent passing in new queries (how would they do that?)
  TODO: use a storeEnhancer to setup reducers, check for name colisions
   - _locus_queries
   - _locus_records
   - _locus_schema

  TODO: allow passing in a custom connect function (for use with redux-form)
*/

import React from 'react';
import { connect as reduxConnect } from 'react-redux';
import entries from 'object.entries';
import prepareQueries from './prepareQueries';
import findCachedOrPendingQuery from './findCachedOrPendingQuery';
import buildSelector from './buildSelector';
import resolveRemoteQuery from './resolveRemoteQuery';
import buildUrl from './buildUrl';

export default function locusConnect(Component, queries) {

  class LocusConnect extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { loading: true, error: false };
      this.store = context.store;

      // this.unsubscribe = this.store.subscribe();
      // TODO check if store actually changed.

      this.setup(props);
    }

    setup(props) {
      var preparedQueries = prepareQueries(queries, props);
      this.resolveQueries(preparedQueries);
      var selector = buildSelector(preparedQueries, '_locus_records');
      this.ConnectedComponent = reduxConnect(selector)(Component);
    }

    // TODO dependency: requires _locus_pending/cachedQueries property on state
    resolveQueries(preparedQueries) {
      const promisedQueries = entries(preparedQueries).map(([_, query]) => {
        // TODO might be possible to resolve queries async in a webworker

        // TODO is there a performance hit for getting the state in each iteration of this loop?
        const {
          _locus_queries,
        } = this.store.getState();

        // TODO: Returns a promise or undefined
        const cachedOrPendingQuery = findCachedOrPendingQuery(_locus_queries, query);

        if (cachedOrPendingQuery) {
          return cachedOrPendingQuery;
        }
        else {
          // TODO urlOptions assignment has way too much knowlege of how to find the schema and its stucture.
          const urlOptions = this.store.getState()._locus_schema[query.target].remote;
          const url = buildUrl(query, urlOptions); // TODO need format?
          const queryPromise = resolveRemoteQuery(url).then(data => {
            var records = data[query.target];
            this.store.dispatch({
              type: 'RECEIVE_REMOTE_RECORDS', // TODO
              target: query.target,
              records,
            });
          });

          // Adds query to list of pending/cached queries
          this.store.dispatch({ type: 'FETCH_REMOTE_RECORDS', query, queryPromise }); // TODO

          return queryPromise;
        }
      });

      Promise.all(promisedQueries)
        .then(() => this.setState({ loading: false }))
        .catch(error => this.setState({ error }));
    }

    componentWillUnmount() {
      // TODO is there a possibility of an error here? Need to try/catch? use a Error Monad?
      // this.unsubscribe();
    }

    // TODO should component update

    componentWillReceiveProps(nextProps) {
      this.setup(nextProps);
    }

    render() {
      if (this.state.loading) {
        // TODO allow custom loading component
        return <div>Loading records...</div>;
      }
      else if (this.state.error) {
        // TODO allow custom error component
        // TODO retry functionality? automatic? manual?
        return <div>There was an error loading...</div>;
      }
      else {
        // TODO: check for props that conflict with data attributes
        return <this.ConnectedComponent {...this.props} />; // TODO
      }
    }
  }

  LocusConnect.contextTypes = {
    store: React.PropTypes.object.isRequired, // TODO better validation
  };

  return LocusConnect;
}
