import _validateAdapter from './validateAdapter';

export default function validateSchema({
  schema,
  validateAdapter = _validateAdapter,
}) {
  /*
    schema properies starting with a $ are global descriptors that apply
    to all collections.
  */
  if (schema.$adapter) {
    validateAdapter('global', schema.$adapter);
  }

  /*
    A schema is an object who's properties are names of collections
    and value's are objects that describe expectations about the
    respective collections.
  */
  Object.entries(schema).forEach(([name, descriptor]) => {
    /*
      Each descriptor must have a valid adapter.
    */

    // No global adapter or collection adapter provided
    if (!schema.$adapter && !descriptor.adapter) {
      // TODO better error with link to docs
      throw new Error(`REDUX-DATA: No global adapter or ${name} adapter provided in schema.`);
    }
    else if (descriptor.adapter) {
      validateAdapter(
        name,
        {
          ...(schema.$adapter || {}),
          ...descriptor.adapter,
        }
      );
    }
  });
}
