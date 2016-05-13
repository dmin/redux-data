const entries = require('babel-runtime/core-js/object/entries').default;

if (process.env.NODE_ENV !== 'production') {
  var assert = require('./assert');
}

/*
  TODO description, params, return
*/
function applyPropsToOperations(
  operationDescriptors,
  props,
  createOperation
) {
  return (
    entries(operationDescriptors).reduce(
      (operations, [operationName, applyPropsToOperation]) => {

        if (process.env.NODE_ENV !== 'production') {
          // TODO should I pass in the compoent's name just for this assert?
          assert(typeof applyPropsToOperation === 'function', `Commands and queries must be defined with a function that accepts props and returns a command or query object. See "${operationName}" (might be a command or query).`);
        }

        const op = applyPropsToOperation(props);
        return Object.assign(
          {},
          operations,
          { [operationName]: createOperation ? createOperation(op, operationName) : op }
        );
      },
      {}
    )
  );
};

module.exports = applyPropsToOperations;
