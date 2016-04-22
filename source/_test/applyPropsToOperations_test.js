import test from 'tape';

import applyPropsToOperations from '../applyPropsToOperations';

const operationDescriptors = {
  od1: props => `op 1, ${props.prop1}, ${props.prop2}`,
  od2: props => `op 2, ${props.prop1}, ${props.prop2}`,
};

const props = {
  prop1: 'value 1',
  prop2: 'value 2',
};

test('applyPropsToOperation...', assert => {
  const createOperation = undefined;

  const actual = applyPropsToOperations(
    operationDescriptors,
    props,
    createOperation
  );

  const expected = {
    od1: 'op 1, value 1, value 2',
    od2: 'op 2, value 1, value 2',
  };

  assert.deepEqual(actual, expected, 'when not given createOperation, returns object with same keys, and values as supplied functions applied to supplied props.');
  assert.end();
});


test('applyPropsToOperation...', assert => {
  const createOperation = op => `${op} change`;

  const actual = applyPropsToOperations(
    operationDescriptors,
    props,
    createOperation
  );

  const expected = {
    od1: 'op 1, value 1, value 2 change',
    od2: 'op 2, value 1, value 2 change',
  };

  assert.deepEqual(actual, expected, 'when supplied createOperation, returns object with same keys, and values as supplied functions applied to supplied props, then applied to createOperation.');
  assert.end();
});
