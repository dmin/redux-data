import entries from 'object.entries';

export default function prepareQueries(queries, props) {
  return (
    entries(queries).reduce(
      (preparedQueries, [queryName, applyPropsToQuery]) => {
        return { ...preparedQueries, [queryName]: applyPropsToQuery(props) };
      },
      {}
    )
  );
}
