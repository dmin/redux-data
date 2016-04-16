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
import request from './request';
import buildUrl from './buildUrl';
import processRemoteRecords from './processRemoteRecords';

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
    getSchemaAction(recordType, action) {
      return this.store.getState()._locus_schema[recordType].actions[action];
    }

    getRemoteOptions(recordType) {
      // TODO can knowledge of the schema here somehow be reduced?
      return this.store.getState()._locus_schema[recordType].remote;
    }

    // TODO dependency: requires _locus_pending/cachedQueries property on state
    resolveQueries(preparedQueries) {
      const promisedQueries = Object.entries(preparedQueries).map(([_, query]) => {
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
          const recordTypeRemoteOptions = this.getRemoteOptions(query.target);
          const url = buildUrl(query, recordTypeRemoteOptions); // TODO need format?
          const recordsPromise = request(url, 'GET'); // TODO this is really just Jquery.getJSON - refactor to use fetch?
            // TODO what if we want to receive records of multiple types?

          const processedRecordsPromise = processRemoteRecords(recordsPromise, recordTypeRemoteOptions.names.collection, recordTypeRemoteOptions.names.fields)
            .then(records => {

              this.store.dispatch({
                type: 'LOCUS_RECEIVE_REMOTE_RECORDS',
                target: query.target,
                records,
              });
            })
            // TODO unless I catch errors, the promises will swallow all errors
            .catch(e => console.log(e));

          // Adds query to list of pending/cached queries
          this.store.dispatch({ type: 'FETCH_REMOTE_RECORDS', query, processedRecordsPromise }); // TODO

          return processedRecordsPromise;
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
