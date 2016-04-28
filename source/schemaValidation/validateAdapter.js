import pipe from 'lodash.flow';

export default function validateAdapter(name, adapter) {

  const checkHandleError = adapter => {
    const type = typeof adapter.handleError;
    if (type !== 'function') {
      throw new Error(`${name} adapter must provide a property 'handleError' that contains a function. Found ${type}`);
    }
  };

  pipe(
    checkHandleError
  )(adapter);
}
