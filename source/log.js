const curry = require('lodash.curry');

module.exports = curry((note, variable) => {
  console.log(note, '::', variable);
  return variable;
});
