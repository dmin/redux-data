/*
  TODO schema validator
  TODO web based schema editor
*/

export default {

  items: {

    adapter: {
      pluralName: 'items',
      singularName: 'item',
    },

    fields: [
      { name: 'id', type: String }, // by default id not allowed when updating/creating
      { name: 'name', type: String },
      { name: 'quantity', type: Number }, // TODO also decimal type?
      // TODO support date types
    ],

    associations: [
      { relation: 'hasMany', associatedType: 'usage' },
    ],
  },
};
