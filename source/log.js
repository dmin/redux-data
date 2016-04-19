import curry from 'lodash.curry';

export default curry((note, variable) => {
  console.log(note, '::', variable);
  return variable;
});
