const curry = require('lodash.curry');
const entries = require('babel-runtime/core-js/object/entries').default;

const os = (schema, config, object) => {
  let warnings = [];

  const warn = message => {
    warnings.push(message);
  };

  const error = message => {
    throw new Error(message);
  };

  const notify = curry((key, message, isWarning, isForObject) => {
    const fullMessage = isForObject ? config.messageForObject(message) : config.messageForKey(key, message);
    isWarning ? warn(fullMessage) : error(fullMessage);
  });

  const validator = object => {
    entries(object).forEach(([key, value]) => {
      if (schema[key]) {
        schema[key](value, notify(key));
      }
      else {
        notify(null, `"${key}" is not a valid property`, true, true);
      }
    });
  };

  validator(object);
  return warnings;
};


os.and = (...conditions) => {
  return (value, notify) => {
    conditions.forEach(condition => {
      condition(value, notify);
    });
  };
};


os.oneOf = (allowedValues, options = {}) => {
  return (value, notify) => {

    const isDefined = value !== null && value !== undefined;
    const isAllowed = !allowedValues.some(allowedValue => allowedValue === value);

    if (isDefined && isAllowed) {
      const message = `must be one of: ${allowedValues}`;
      notify(options.message || message, options.warn);
    }
  };
};


os.required = (options = {}) => {
  return (value, notify) => {
    if (!value) {
      const message = 'is required';
      notify(message, options.warn);
    }
  };
};

module.exports = os;
