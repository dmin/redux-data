const camelCase = require('lodash.camelcase');
const snakeCase = require('lodash.snakeCase');
const entries = require('babel-runtime/core-js/object/entries').default;

const createQueryResolver = require('./adapter/createQueryResolver');

// TODO how to handle urls for nested resources in rails/similar apps
// TODO simple config that defines what capabilities a server has
// TODO turn this into a generic REST adapter, use ember-data's REST adapter as reference point
export default {

  baseUrl: '',
  format: undefined,

  registerTypeAdapters(schema) {
    this.typeAdapters = {};
    entries(schema).forEach(([type, typeSchema]) => {
      // TODO need to validate that typeSchema provides needed info
      this.typeAdapters[type] = typeSchema.adapter;
    });
  },

  handleError(error) {
    if (error.status === 422) {
      // TODO not a pure function if it throws w/o catch
      if (!error.response.body.errors) {
        throw new Error('This adapter expects server responses with a http status code of 422 to include a JSON object with an errors property containing validation messages.');
      }
      // Return a rejected promise so the user can catch the error.
      return Promise.reject(
        // this should be parsed JSON (done by superagent)
        error.response.body.errors
      );
    }

    // TODO: need to handle 404 not found errors
  },


  formatRecordForServer(record) {
    // TODO how inefficient is this? time/space?
    // Also see formatRecordForClient
    // can a function be created at build time to do this efficiently?
    // would it be more efficient to create a new key and delete the old key, mutating the object?
    // best would be to make sure the server returns proper field names and there is an option to turn this off (and remove from build?)
    return entries(record).reduce((formattedRecord, [key, value]) => {
      return Object.assign(
        {},
        formattedRecord,
        { [snakeCase(key)]: value }
      );
    }, {});
  },


  formatRecordForClient(record) {
    return entries(record).reduce((formattedRecord, [key, value]) => {
      return Object.assign(
        {},
        formattedRecord,
        { [camelCase(key)]: value }
      );
    }, {});
  },


  updateRecord: {
    // TODO need to assert that fields has id property
    method: 'PATCH', // TODO or PUT?
    url: (adapter, fields, _props) => `${adapter.baseUrl}/${adapter.pluralName}/${fields.id}.json`,
    requestBody: (adapter, fields, _props) => ({ [adapter.singularName]: fields }),

    // TODO document that super agent already parses JSON, and how to handle other data types
    responseBody: (adapter, body) => body[adapter.singularName],
  },


  createRecord: {
    method: 'POST', // TODO or PUT?
    url: (adapter, _fields, _props) => `${adapter.baseUrl}/${adapter.pluralName}.json`,
    requestBody: (adapter, fields, _props) => ({ [adapter.singularName]: fields }),

    // TODO document that super agent already parses JSON, and how to handle other data types
    responseBody: (adapter, body) => body[adapter.singularName],
  },


  deleteRecord: {
    method: 'DELETE', // TODO or PUT?
    url: (adapter, recordId, _props) => `${adapter.baseUrl}/${adapter.pluralName}/${recordId}.json`,
    // TODO it be great to omit these if not needed.
    requestBody: _ => _, //
    responseBody: _ => _,
  },


  /*
    TODO how to error when adapter doesn't support a feature? Probably should
    give error during query validation.
  */
  queryRecords(query) {
    return createQueryResolver({
      // TODO creating a 'custom made' adapter for each query here, not very elegant or performant.
      adapter: Object.assign({}, this, this.typeAdapters[query.target]),
      parseResponseBody: (adapter, body) => body[adapter.pluralName], // TODO docs: this gets parsed JSON (from superagent)
    }).resolve(query);
  },
};
