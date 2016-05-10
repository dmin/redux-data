const curry = require('lodash.curry');
const entries = require('babel-runtime/core-js/object/entries').default;

const os = (schema, requiredProps, config, object, warnings = []) => {

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
    _checkRequiredProps(requiredProps, object, notify);

    entries(object).forEach(([key, value]) => {
      if (schema[key]) {
        schema[key](value, notify(key), warnings);
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
    const isAllowed = !allowedValues.some(allowedValue => allowedValue === value);

    if (_isDefined(value) && isAllowed) {
      const message = `must be one of: ${allowedValues}`;
      notify(options.message || message, options.warn, false);
    }
  };
};

os.object = (value, options = {}) => {
  return (value, notify, warnings) => {
    if (_isDefined) {
      if (typeof value !== 'object') {
        const message = 'must be an object';
        notify(message, options.warn, false);
      }
    }
  };
};

module.exports = os;

function _isDefined(value) {
  return value !== null && value !== undefined;
}

function _checkRequiredProps(requiredKeys, object, notify) {
  requiredKeys.forEach(({ key, warn }) => {
    if (object[key] === undefined) {
      const message = `The "${key}" property is required`;
      notify(key, message, warn, true);
    }
  }, []);
}
