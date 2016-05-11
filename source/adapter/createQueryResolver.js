const entries = require('babel-runtime/core-js/object/entries').default;
const snakeCase = require('lodash.snakeCase');

const _request = require('../request').default; // TODO use fetch?

class QueryResolver {
  constructor({
    adapter,
    parseResponseBody,
  }) {
    // TODO assert arguments
    // TODO common assert for accepting name args with object
    this._adapter = adapter;
    this._parseResponseBody = parseResponseBody.bind(null, this._adapter);
  }

  resolve(query, computeUrl = _computeUrl, request = _request, extractNestedQueries = _extractNestedQueries) {
    const queries = extractNestedQueries(query);

    return Promise.all(
      queries.map(query => {
        const url = computeUrl(this._adapter, query);
        return request(url, 'GET')
          .then(this._parseResponseBody)
          .then(records => records.map(this._adapter.formatRecordForClient))
          .then(records => records.map(record => Object.assign(record, { _type_: query.target }))); // TODO this should be combined with formating/normalizing/typecasting
      })
    ).then(recordGroups => recordGroups.reduce((flattened, records) => flattened.concat(records)));
  }
}


function _extractNestedQueries(query) {
  if (!query.include) { return [query]; }

  throw new Error('"include" clause not supported by this adapter.');

  // const parentQuery = Object.keys(query).reduce((_parentQuery, key) => {
  //   if (key === 'include') { return _parentQuery; }
  //   else {
  //     _parentQuery[key] = query[key];
  //     return _parentQuery;
  //   }
  // }, {});
  //
  // const childQueriesCreators = values(query.include).map(childQuery => {
  //   return parent => {
  //     return Object.assign(
  //       {},
  //       {
  //         target: childQuery.association,
  //
  //       }
  //     );
  //   };
  // });
}


function _computeUrl(adapter, query) {
  const format = adapter.format ? `.${adapter.format}` : '';
  const where = query.where ? _whereQueryString(query.where) : '';
  const queryStringPrep = `${where}`;
  const queryString = queryStringPrep ? `?${queryStringPrep}` : '';

  // TODO extract all this logic to adapter so user can have complete control over how urls are built
  const preparedUrl = `${adapter.baseUrl}/${adapter.pluralName}${format}${queryString}`;

  if (process.env.NODE_ENV !== 'production') {
    // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    if (preparedUrl.length > 2048) {
      // TODO centralize warnings
      // TODO should this be error?
      console.warn('REDUX-DATA ADAPTER: Query produced a URL longer than 2048 characters. This may cause problems in older browsers (Internet Explorer).');
    }
  }

  return preparedUrl;
}


function _whereQueryString(criteria) {
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


module.exports = function createQueryResolver(...args) {
  return new QueryResolver(...args);
};
