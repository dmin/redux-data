import test from 'tape';
import validateAdapter from '../../schemaValidation/validateAdapter';

// TODO can we use randomized property based testing here?
test('validateAdapter: given a valid adapter, does not throw', assert => {
  const validAdapter = {
    handleError: _ => _,
  };
  assert.doesNotThrow(() => validateAdapter('test', validAdapter));

  const invalidAdapter = {};
  assert.throws(() => validateAdapter('test', invalidAdapter));

  assert.end();
});
