import _selectRecords from './selectRecords';

/*
  # createQueryGroupSelector
  Returns a function that, when applied to a state object, returns an object
  with the same shape as the queries param, but with each property value the
  result of its respective query.

  @param {Object} queries - An object with queries as property values
  @param {String} recordsProperty - name of the property in your state object containing records
  @param {Function} selectRecords - used to create a selector function. TODO more details
  @return {Function} - When applied to state object returns result of queries
  @example TODO

  TODO: check types (dev only for better error messages)
*/
export default function createQueryGroupSelector(
  queries,
  selectRecords = _selectRecords
) {
  return state => {
    return Object.entries(queries).reduce((namedSelectors, [queryName, query]) => {
      return { [queryName]: selectRecords(state, query), ...namedSelectors };
    }, {});
  };
}
