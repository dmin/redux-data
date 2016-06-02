/*
  TODO: need to validate queries against schema
  TODO: prevent passing in new queries (how would they do that?)

  TODO: allow passing in a custom connect function (for use with redux-form)

  TODO only subscribe to the types the queries care about (included nested queries)

  TODO nested queries

  TODO merge queries for servers/adapters that support it

  TODO prepare query selectors during idle time

  TODO: extract actions to constants

  TODO: can we check if queries are in the store on initialization? ()

  TODO might be possible to resolve queries async in a webworker

  TODO: if commands also have attached queries, when should they
  subscribe to the store?

  TODO: memoize or otherwise save selector functions for queries so they don't have to be recreated (i.e. cache selector functions)

  TODO: documentation might talk about dispatching actions to local or remote stores (and in the future there might be server s`ide code to make this official)

  TODO DEFINE:
   - commands (description of mutation, does not need to be serializable)
   - action - object which can be dispatched to redux
   - action creator - function which creates action
*/

import React from 'react';

import _Loading from './Loading';
import _Error from './Error';

// TODO move towards dependency injection as much as makes sense
import { connect as reduxConnect } from 'react-redux';
import applyPropsToOperations from './applyPropsToOperations';
import findCachedOrPendingQuery from './findCachedOrPendingQuery';
import buildSelector from './buildSelector';
import request from './request';
import typeCastFields from './typeCastFields';

import curry from 'lodash.curry';
const entries = require('babel-runtime/core-js/object/entries').default;

if (process.env.NODE_ENV !== 'production') {
  var assert = require('./assert');
}

export default function connect(
  Component,
  {
    commands: commandDescriptors = {},
    queries: queryDescriptors = {},
    Loading = _Loading,
    Error = _Error,
    createReduxConnect = (selector, Component) => reduxConnect(selector)(Component),
  }
) {

  class ReduxData extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { loading: true, error: false };
      this.store = context.store;

      if (process.env.NODE_ENV !== 'production') {
        // TODO I don't have process.env.NODE_ENV defined as a var
        // in webpack, so where is it coming from in the browser? react?
        // TODO ensure that during build process this code is removed
        // and the require statements below are not added to the webpack
        // bundle.
        const validateSchema = require('./schemaValidation/validateSchema').default;
        validateSchema({ schema: this.store.getState()._data_.schema });
      }

      this.schema = this.store.getState()._data_.schema; // TODO better way of accessing schema
      this.adapter = this.schema.$adapter;
    }

    componentWillMount() {
      this.setup(this.props);
    }

    componentWillReceiveProps(nextProps) {
      // TODO would a deepEquals here be more efficient than running the queries again?
      // TODO if we assume props were immutable data structures we could do a very fast equality check here
      this.setup(nextProps);
    }

    setup(props) {
      // TODO it would be good to validate commands and queries here and warn if they are not formated correctly (also run this check when they are executed and give error in that case)
      this.commands = applyPropsToOperations(
        commandDescriptors,
        props,
        (command, commandName) => data => this.executeCommand(command, data, commandName)
      );

      // TODO if a query/command does not rely on props allow it to be passed as an object, so it doesn't need to go through applyPropsToOperationDescriptors
      const queries = applyPropsToOperations(queryDescriptors, props);
      this.resolveQueries(queries);

      const recordsSelector = buildSelector(queries); // TODO check if selectors actually need to be rebuilt/can we just memoize?
      this.selector = state => recordsSelector(state._data_.records); // TODO it would be great to extract this knowledge of the redux store even further

      /*
        Under certain circumstances, React-Redux will not update if it
        determines that the props passed to a component will not affect the
        result of the mapStateToProps function. It makes this determination by
        checking if mapStateToProps takes a second argument. Since the
        mapStateToProps function created here does depend on props (as supplied
        to the queries) we need to define a second (unused) argument, "_",
        to force React-Redux to update appropriately.
      */
      const mapStateToProps = (state, _) => {
        return this.selector(state);
      };

      // TODO can the dependency on react-redux.connect be extracted from this file?
      this.ConnectedComponent = (
        this.ConnectedComponent ||
        createReduxConnect(mapStateToProps, Component)
      );
    }


    updateRecord(...args) {
      return this.saveRecord('update', ...args);
    }


    createRecord(...args) {
      return this.saveRecord('create', ...args);
    }


    saveRecord(mutationType, adapter, recordType, rawFields, rawPresetFields) {
      const typeCastRecordTypeFields = curry(typeCastFields)(
        this.schema,
        recordType
      );

      // TODO is there a reason to type cast the fields before they are sent to the server (other than optimitic updating?)
      // Should something like ember's serializers be implemented?
      const fields = typeCastRecordTypeFields(
        Object.assign({}, rawFields, rawPresetFields)
      );

      const serverFields = adapter.formatRecordForServer(fields);

      // Update record on server
      return request(
        adapter[`${mutationType}Record`].url(adapter, serverFields, this.props),
        adapter[`${mutationType}Record`].method,
        adapter[`${mutationType}Record`].requestBody(adapter, serverFields, this.props)
      )
      // TODO would it make sense to format field names and do value type casting in one step?
      .then(responseBody => adapter[`${mutationType}Record`].responseBody(adapter, responseBody))
      .then(adapter.formatRecordForClient)
      .then(record => Object.assign(record, { _type_: recordType }))
      .then(typeCastRecordTypeFields)

      // Then update record in store
      .then(record => {
        this.store.dispatch({
          type: `DATA_${mutationType.toUpperCase()}_RECORD`,
          recordType,
          record,
        });

        return record;
      });
    }


    deleteRecord(adapter, recordType, rawId, _rawPresetFields, thenFn) {
      const recordId = String(rawId);

      // Update record on server
      return request(
        adapter.deleteRecord.url(adapter, recordId, this.props),
        adapter.deleteRecord.method,
        adapter.deleteRecord.requestBody(adapter, recordId, this.props)
      ).then(_ => {

        /*
          TODO This is a temp fix:
          Without this special call the the 'thenFn' here the commoand's
          then function (if supplied) will not be invoked until after the store
          has updated and the changes have been flushed to react. This means that
          if a component is displaying a record that is being deleted the react-
          redux will update the component before the commands 'then' is called,
          which will give an error since it's tring to render a record that
          has been deleted. Need to rework how the async work in redux-data is
          performed.

          The ideal case is that the store gets updated with the deletion (or
          creation or update), but that change to the store does not trigger
          react-redux to update components (only when there is a then)
        */
        if (thenFn) { thenFn(); }

        this.store.dispatch({
          type: 'DATA_DELETE_RECORD',
          target: recordType, // TODO rename to recordType
          data: recordId, // TODO rename to record
        });
      });
    }


    executeCommand(command, data, commandName) { // TODO rename data to input
      const target = command.target; // TODO rename to recordType
      const actionName = command.action; // TODO rename to mutation or mutationType
      const presetFields = command.preset || {};

      if (process.env.NODE_ENV !== 'production') {
        assert(this.schema[target], `"${target} is not a record type listed in the schema. See the "${commandName}" command for "${Component.name}"`);
      }

      const adapter = this.adapterFor(target);

      if (process.env.NODE_ENV !== 'production') {
        // TODO should development errors be tested (i.e. these assert statements)? Should there be an option to use them in production? Is there a good reason to do that?
        assert(/^(create|update|delete)$/i.test(actionName), `"${actionName}" is not a valid mutation. Must be one of the following: create, update, delete. See the "${commandName}" command for "${Component.name}"`);
        // TODO can the message also indicate if the application adapter or a custom adapter for this record type is being used?
        assert(adapter[`${actionName}Record`], `The adapter for "${target}" does not support the "${actionName}" mutation. See the "${commandName}" command for "${Component.name}"`);
      }

      return this[`${actionName}Record`](adapter, target, data, presetFields, command.then) // TODO remove command.then from arguments list, see this.deleteRecord
        .then(record => {
          // TODO should there be a way to tell Redux-Data not to trigger a "store changed" event if the route(or something else) is going to be changing anyway? The goal would be to reduce render churn, is this happening?
          command.then ? command.then(record) : undefined;

          return record;
        })
        .catch(error => {
          return adapter.handleError(error);
        });

      // TODO determine if a remote action is expected to return records - how can an action indicate it wants to run a query after the action is complete? if server supports this could be done in one request, if not, two requests
      // TODO response here might not be records - it could be the result of a query, or something else the server decides to send back, need to be able to configure this

      // TODO handle errors (http/validation) If remote action fails need rollback plan
      // This is currently handled by returning this promise, if rejected it will give
      // errors to calling function, which user will have to deal with. Needs to be documented.
    }

    // TODO remove this method in favor of this.adapter
    // will need to update commands in adapter to use adapter.typeAdapters[target]
    adapterFor(recordType) {
      // TODO memoize this funtion
      // TODO can adapter be an instance of an adaper made for this record type, can avoid passing in recordType, since we're already creating an adapter on the fly in adapterFor
      if (this.schema.$adapter && this.schema[recordType].adapter) {
        return Object.assign(
          {},
          this.schema.$adapter,
          this.schema[recordType].adapter
        );
      }
      else if (!this.schema.$adapter) {
        return this.schema[recordType].adapter;
      }
      else {
        return this.schema.$adapter;
      }
    }

    // TODO dependency: requires _data_.queries property on state (which contains previous queries)
    resolveQueries(queries) {
      const promisedQueries = entries(queries).map(([queryName, query]) => {

        if (process.env.NODE_ENV !== 'production') {
          const schemaManager = require('./createSchemaManager').default(this.schema);
          const validateQuery = require('./validateQuery');
          if (!validateQuery(query, schemaManager, queryName, Component.name)) { // TODO Function.name not supported by IE
            throw new Error('Invalid query');
          }
        }

        // TODO might be possible to resolve queries async in a webworker

        // TODO is there a performance hit for getting the state in each iteration of this loop?
        // TODO why do I need to get fresh state of _data_.queries each iteration?
        const {
          queries: previousQueries,
        } = this.store.getState()._data_;

        // TODO: Returns a promise or undefined
        const serializedQuery = JSON.stringify(query);
        const cachedOrPendingQuery = findCachedOrPendingQuery(previousQueries, serializedQuery);

        if (cachedOrPendingQuery) {
          return cachedOrPendingQuery;
        }
        else {
          // TODO what if we want to receive records of multiple types?

          const recordsPromise = (
            // TODO can 'request' be replaced with 'fetch' (would need to use polyfill)?
            this.adapter.queryRecords(query)
              .then(records => {
                return records.map(record => {
                  return typeCastFields(this.schema, query.target, record);
                });
              })
              .then(records => {
                this.store.dispatch({
                  type: 'DATA_RECEIVE_REMOTE_RECORDS',
                  target: query.target,
                  records,
                });
              })
              // TODO unless I catch errors, the promises will swallow all errors
              .catch(e => console.log(e))
          );

          // Adds query to list of pending/cached queries
          // TODO rename this action to some thing like ADD_QUERY
          this.store.dispatch({ type: 'FETCH_REMOTE_RECORDS', serializedQuery, recordsPromise });

          return recordsPromise;
        }
      });

      Promise.all(promisedQueries)
        .then(() => this.setState({ loading: false }))
        .catch(error => console.error(error))
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
        return <Loading />;
      }
      else if (this.state.error) {
        // TODO retry functionality? automatic? manual?
        // TODO pass in error message (different in dev/prod?)
        console.log(this.state.error);
        return <Error />;
      }
      else {
        // TODO: check for props that conflict with data attributes
        // TODO: would it be more performat to move the creation of ConnectedComponent to a memoized method?
        return <this.ConnectedComponent {...this.props} {...this.commands} />;
      }
    }
  }

  ReduxData.contextTypes = {
    store: React.PropTypes.object.isRequired, // TODO better validation
  };

  return ReduxData;
}
