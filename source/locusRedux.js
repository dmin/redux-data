/*
  TODO: need to validate queries against schema
  TODO: prevent passing in new queries (how would they do that?)
  TODO: use a storeEnhancer to setup reducers, check for name colisions
   - _locus_queries
   - _locus_records
   - _locus_schema

  TODO: allow passing in a custom connect function (for use with redux-form)

  TODO: extract actions to constants

  TODO: documentation might talk about dispatching actions to local or remote stores (and in the future there might be server side code to make this official)

  TODO DEFINE:
   - commands (description of mutation, does not need to be serializable)
   - action - object which can be dispatched to redux
   - action creator - function which creates action
*/

import React from 'react';
import { connect as reduxConnect } from 'react-redux';
import applyPropsToOperations from './applyPropsToOperations';
import findCachedOrPendingQuery from './findCachedOrPendingQuery';
import buildSelector from './buildSelector';
import request from './request';
import buildUrl from './buildUrl';
import processRemoteRecords from './processRemoteRecords';
import typeCastFields from './typeCastFields';

export default function locusConnect(Component, { commands: commandDescriptors = {}, queries: queryDescriptors = {} }) {

  class LocusConnect extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { loading: true, error: false };
      this.store = context.store;
    }

    componentWillMount() {
      this.setup(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this.setup(nextProps);
    }

    setup(props) {
      // TODO it would be good to validate commands and queries here and warn if they are not formated correctly (also run this check when they are executed and give error in that case)
      this.commands = applyPropsToOperations(
        commandDescriptors,
        props,
        command => data => this.executeCommand(command, data)
      );

      var queries = applyPropsToOperations(queryDescriptors, props);
      this.resolveQueries(queries);
      // TODO instead of passing in '_locus_records' use a wrapping function
      var selector = buildSelector(queries, '_locus_records'); // TODO check if selectors actually need to be rebuilt/can we just memoize?
      this.ConnectedComponent = reduxConnect(selector)(Component); // TODO pass commands
    }

    executeCommand(command, data) {
      const target = command.target; // TODO rename to collection
      const actionName = command.action; // TODO rename (action should have one meaning: a redux action)

      let typeCastData;
      // TODO action names should be case sensitive?
      if (actionName === 'update' || actionName === 'create') {
        // type cast fields
        const schema = this.store.getState()._locus_schema; // TODO better way of accessing schema
        typeCastData = typeCastFields(schema, target, data);
      }
      else if (action === 'delete') {
        // data for a delete action should be a string representing a record id.
        typeCastData = String(data);
      }

      // TODO this code knows a lot about how actions/commands are structured
      const action = this.getSchemaAction(target, command.action);
      // if optimistic do that here

      // do remote
      const { url, method, requestBody } = action.remote;
      const remoteActionPromise = request(
        url(typeCastData, this.props),
        method,
        requestBody(typeCastData, this.props)
      );

      // TODO determine if a remote action is expected to return records - how can an action indicate it wants to run a query after the action is complete? if server supports this could be done in one request, if not, two requests
      // TODO response here might not be records - it could be the result of a query, or something else the server decides to send back, need to be able to configure this

      remoteActionPromise.then(_ => { // TODO right now we don't care what the server sends back - need to check response type, validation errors, and if the user wants to work with the data that came back
        this.store.dispatch({
          // TODO this seems fragile
          type: `LOCUS_${command.action.toUpperCase()}_RECORD`,
          target: target,
          typeCastData,
          // TODO using something like redux-react-router could update the url here
          // TODO using something like redux-react-router could update the url here
        });

        // TODO is this the best place for this?
        // TODO should there be a way to tell locus not to trigger a "store changed" event if the route(or something else) is going to be changing anyway?
        command.then ? command.then() : undefined;
      });
      // TODO handle errors (http/validation) If remote action fails need rollback plan

    }

    getSchemaAction(recordType, action) {
      return this.store.getState()._locus_schema[recordType].actions[action];
    }

    getRemoteOptions(recordType) {
      // TODO can knowledge of the schema here somehow be reduced?
      return this.store.getState()._locus_schema[recordType].remote;
    }

    // TODO dependency: requires _locus_pending/cachedQueries property on state
    resolveQueries(queries) {
      const promisedQueries = Object.entries(queries).map(([_, query]) => {
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

    // TODO should component update
    // TODO question: does componentWillRecieveProps run if shouldComponentUpdate returns false?

    render() {
      // TODO These states are for determining if all the 'required'
      // queries have been resolved
      // TODO implement 'defered' queries
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
        // TODO: would it be more performat to move the creation of ConnectedComponent to a memoized method?
        return <this.ConnectedComponent {...this.props} {...this.commands} />;
      }
    }
  }

  LocusConnect.contextTypes = {
    store: React.PropTypes.object.isRequired, // TODO better validation
  };

  return LocusConnect;
}
