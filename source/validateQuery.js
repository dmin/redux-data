/*
  Description: This function is meant to aid developers in catching errors in
  queries during development. It is not intended to be invoked in production.

  TODO can we make a Flow/TypeScript type in place of this? Would they be able to access the schema?

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

export default function validateQuery(query, schemaManager, queryName, componentName) {
  // TODO type check arguments or use Flow?

  let messages = [];

  const clauses = {
    target: { // TODO rename to collection
      isRequired: true,
      type: type => schemaManager.isCollectionType(type),
    },

    limit: {
      isRequired: false,
      warn() {
        // TODO it would be great to give more information about which query needs to be fixed
        // TODO if the schema provides a default limit, should that be injected into the query before it's validated? If so, should 'limit' be required?
        messages.push({
          type: 'warn',
          message: `You did not specify a 'limit' clause in the "${queryName}" for "${componentName}".`,
        });
      },
      type: type => typeof type === 'number',
    },

    select: {
      isRequired: false,
      type: fields => {
        if (!Array.isArray(fields)) {
          messages.push({
            type: 'error',
            message: `Value of a query's 'select' clause must be an array of strings (representing field names). See the "${queryName}" query for "${componentName}".`,
          });
          return false;
        }

        const hasValidFields = fields.reduce((result, field) => {
          if (!schemaManager.isCollectionField(query.target, field)) {
            messages.push({
              type: 'error',
              message: `"${field}" does not appear to be a field in the "${query.target}" collection. See the 'select' clause from the "${queryName}" query for "${componentName}".`,
            });
            return false;
          }
          return result;
        }, true);

        if (!hasValidFields) {
          return false;
        }

        return true;
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
}
