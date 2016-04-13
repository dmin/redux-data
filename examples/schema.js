/*
  TODO schema validator
  TODO web based schema editor
*/

export default {

  items: {
    remote: {
      rootKey: true, // TODO might be a string which is the name of the expected root key?
      names: {
        record: 'item',
        collection: 'items', // TODO this is being used a root key of json server response for collections
      },
      baseUrl: '',
      format: 'json',
      parseCollectionResponse: response => response.items, // TODO default
      parseRecordResponse: response => response.item, // TODO default
      capabilities: {
        offset: true,
        limit: true, // TODO what should be default? TODO: what if server doesn't accept option, but always limits number of results?
      },
    },

    fields: [
      { id: String }, // by default id not allowed when updating/creating
      { name: String },
    ],

    actions: {

    },

    // TODO handle responses, what json shape is expected?

    // create/update/destroy automatically created
    // action: [
    //   { create: false },
    //   { toggle: something => 'do something'}
    // ]
  },
};

/*
  TODO extract REST adapter - modifies schema validator
  TODO schema validator:
   -
*/

/*
  TODO query validator:
   - invariant(schema[query.target], `The query target '${query.target} does not exist in the schema.'`);
   - should not contain any functions (or non-serializeable tokens)
*/
