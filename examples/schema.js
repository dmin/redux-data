/*
  TODO schema validator
  TODO web based schema editor
  TODO 'global' fields property that describes how to translate names between server and client (part of an adapter?)
*/

export default {

  items: {
    remote: {
      rootKey: true, // TODO might be a string which is the name of the expected root key?
      names: {
        record: 'item',
        collection: 'items', // TODO this is being used a root key of json server response for collections
        fields: {},
      },
      baseUrl: '',
      format: 'json',
      parseCollectionResponse: response => response.items, // TODO default, translates field names
      parseRecordResponse: response => response.item, // TODO default, translates field names
      capabilities: {
        // TODO how to handle urls for nested resources in rails/similar apps
        offset: true,
        limit: true, // TODO what should be default? TODO: what if server doesn't accept option, but always limits number of results?

        where: (criteria, _url) => {
          // If second argument is requested then expects a full url parts object
          // if only one argument is requested then expects a partial query string
          // OR
          // can return a string (partial query string), or an object which replaces the url object.
          // TODO needs to handle multiple types of criterion
          const queryParams = Object.entries(criteria).reduce((queryParams, [key, value]) => {
            // TODO uri encoding?
            return queryParams.concat(`query[${key}]=${value}`);
          }, []);

          return queryParams.join('&');
        },
      },
    },

    fields: [
      { name: 'id', type: String }, // by default id not allowed when updating/creating
      { name: 'name', type: String },
      { name: 'quantity', type: Number }, // TODO also decimal type?
      // TODO support date types
    ],

    // TODO: should 'adapters' be able to define these?
    actions: {
      update: {
        // TODO local: allow users to override default local actions for create/update/delete, but warn when they do.
        // TODO move this
        // local: (recordType, recordFields) => ({ type: 'LOCUS_UPDATE_RECORD', recordType, recordFields }),

        remote: {
          method: 'PATCH', // TODO or PUT?
          url: (_data, props) => `/categories/${props.params.id}.json`,
          requestBody: (data, _props) => ({ item: data }), // TODO should there be a default for this? Should 'adapters' define this?
          // TODO expected response
          // TODO allows query?
        },
      },
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
