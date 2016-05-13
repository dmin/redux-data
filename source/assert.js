function assert(assertion, message) {
  if (!assertion) {
    throw new Error(`REDUX-DATA: ${message}`);
  }
}

module.exports = assert;
