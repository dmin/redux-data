/*
  TODO schema validator
  TODO web based schema editor
*/

import { defaultAdapter } from '../source/index';

export default {

  $adapter: defaultAdapter,

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
  },
};
