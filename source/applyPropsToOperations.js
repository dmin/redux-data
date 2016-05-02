/*
  TODO description, params, return
*/
export default function applyPropsToOperations(
  operationDescriptors,
  props,
  createOperation
) {
  return (
    Object.entries(operationDescriptors).reduce(
      (operations, [operationName, applyPropsToOperation]) => {
        const op = applyPropsToOperation(props);
        return {
          ...operations,
          [operationName]: createOperation ? createOperation(op, operationName) : op,
        };
      },
      {}
    )
  );
}
