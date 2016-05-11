/*
  Description: This function is meant to aid developers in catching errors in
  queries during development. It is not intended to be invoked in production.

  TODO should not contain any functions (or non-serializeable tokens) (check for valid JSON?)

  TODO can we make a Flow/TypeScript type in place of this? Would they be able to access the schema?
  If so, can we keep this method to for runtime checks but somehow rely on the type definitions?

  What is a valid query?

  - Only has allowed properties
   - target/collection
   - select
   - where
   - offset
   - limit
   - transform

  - Has all required properties:
   - target/collection
*/

module.exports = function validateQuery(query, schemaManager, queryName, componentName) {
  // TODO type check arguments or use Flow?
  if (typeof query !== 'object') { throw new Error('Expected query argument to be an object.'); }
  if (typeof schemaManager !== 'object') { throw new Error('Expected schemaManager argument to be an object.'); }
  if (typeof queryName !== 'string') { throw new Error('Expected queryName argument to be a string.'); }
  if (typeof componentName !== 'string') { throw new Error('Expected componentName argument to be an string.'); }

  let messages = [];

  const clauses = {
    target: { // TODO rename to collection
      isRequired: true,
      type: type => schemaManager.isCollectionType(type),
    },

    select: {
      isRequired: false,
      type: fields => {
        if (!Array.isArray(fields)) {
          messages.push({
            type: 'error',
            message: `Value of a query's 'select' clause must be an array of strings (representing field names). See the "${queryName}" query for the component"${componentName}".`,
          });
          return false;
        }

        return fields.reduce((result, field) => {
          if (!schemaManager.isCollectionField(query.target, field)) {
            messages.push({
              type: 'error',
              message: `"${field}" does not appear to be a field in the "${query.target}" collection. See the 'select' clause from the "${queryName}" query for the component"${componentName}".`,
            });
            return false;
          }
          return result;
        }, true);
      },
    },

    limit: {
      isRequired: false,
      warn() {
        // TODO it would be great to give more information about which query needs to be fixed
        // TODO if the schema provides a default limit, should that be injected into the query before it's validated? If so, should 'limit' be required?
        messages.push({
          type: 'warn',
          // TODO update message about default limit clause
          message: `REDUX-DATA: You did not specify a 'limit' clause in the "${queryName}" query for the component "${componentName}".`,
        });
      },
      type: type => typeof type === 'number',
    },

    offset: {
      isRequired: false,
      type: type => typeof type === 'number',
    },

    where: {
      isRequired: false,
      type: criteria => {
        if (typeof criteria !== 'object') {
          messages.push({
            type: 'error',
            message: `Value of a query's 'where' clause must be an object (representing criteria to filter by). See the "${queryName}" query for the component"${componentName}".`,
          });
          return false;
        }

        return Object.entries(criteria).reduce((result, [key, value]) => {

          // Verify that the field this critrion is operating on is listed in the schema
          const isValidField = schemaManager.isCollectionField(query.target, key);
          if (!isValidField) {
            messages.push({
              type: 'error',
              message: `"${key}" does not appear to be a field in the "${query.target}" collection. See the 'where' clause from the "${queryName}" query for "${componentName}".`,
            });
            return false;
          }


          // 'Advanced' style conditions TODO docs
          if (typeof value === 'object') {
            /*
              TODO Validate/Document advanced where conditions
            */
          }


          // Simple 'equals' style condition TODO docs
          else {
            const isValidFieldType = schemaManager.isCollectionFieldType(query.target, key, value);
            if (!isValidFieldType) {
              messages.push({
                type: 'error',
                message: `"${value}" (a ${typeof value}) does not appear to be a valid type for the "${key}" field in the "${query.target}" collection. See the 'where' clause from the "${queryName}" query for the component "${componentName}".`,
              });
              return false;
            }
          }

          return result;
        }, true);
      },
    },
  };

  const isValid = Object.entries(clauses).every(([clauseName, clause]) => {
    if (query[clauseName]) {
      return clause.type(query[clauseName]);
    }
    else {
      if (clause.isRequired) {
        return false;
      }
      else {
        clause.warn && clause.warn();
        return true;
      }
    }
  });

  messages.forEach(message => console[message.type](message.message));

  return isValid;
};
