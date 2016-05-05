const camelCase = require('lodash.camelcase');
const snakeCase = require('lodash.snakeCase');
const entries = require('babel-runtime/core-js/object/entries').default;

// TODO how to handle urls for nested resources in rails/similar apps
// TODO simple config that defines what capabilities a server has
// TODO turn this into a generic REST adapter, use ember-data's REST adapter as reference point
export default {

  baseUrl: '',


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
    TODO how to error when adapter doesn't support a feature?
    TODO this property is not consistent with updateRecord, createRecord, deleteRecord
    TODO question: queryRecordsURL in an adapter is responsible for tranlating client field names to server field names, can this task be moved to redux-data?
  */
  queryRecords: {
    url(adapter, query) {
      const where = query.where ? whereQueryString(query.where) : '';
      const queryStringPrep = `${where}`;
      const queryString = queryStringPrep ? `?${queryStringPrep}` : '';

      // TODO extract all this logic to adapter so user can have complete control over how urls are built
      const preparedUrl = `${adapter.baseUrl}/${adapter.pluralName}.json${queryString}`;

      if (process.env.NODE_ENV !== 'production') {
        // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
        if (preparedUrl.length > 2048) {
          // TODO centralize warnings
          // TODO should this be error?
          console.warn('REDUX-DATA: Query produced a URL longer than 2048 characters. This may cause problems in older browsers (Internet Explorer).');
        }
      }

      return preparedUrl;
    },
    responseBody: (adapter, body) => body[adapter.pluralName],
  },

};

function whereQueryString(criteria) {
  /*
    TODO this function expects validated criteria, make sure query validator is up to date, how can it be ensured that they stay in sync?
    TODO: if making a ember-data compatable rest adapter the schema validator will need to prevent users from naming fields with query keywords like 'where' and 'limit'
  */
  const queryParams = entries(criteria).reduce((queryParams, [field, conditions]) => {
    // TODO uri encoding?

    if (typeof conditions !== 'object') {
      // TODO Handle this case with a 'query extension' that translates the query into a standard format before it gets here
      queryParams.push(`query[where][${snakeCase(field)}][equal]=${conditions}`);
    }
    else {
      entries(conditions).forEach(([name, value]) => {
        queryParams.push(`query[where][${snakeCase(field)}][${name}]=${value}`);
      });
    }

    return queryParams;
  }, []);

  return queryParams.join('&');
  // TODO log/warn length of url - config option to move to POST when too long?
}
