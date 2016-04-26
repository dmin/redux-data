/*
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
        console.warn(`You did not specify a "limit" clause in the ${queryName} for ${componentName}.`);
      },
      type: type => typeof type === 'number',
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

  return isValid;
}
