export default function applyPropsToQueries(queryCreators, props) {
  return (
    Object.entries(queryCreators).reduce(
      (queries, [queryName, queryCreator]) => {
        return { ...queries, [queryName]: queryCreator(props) };
      },
      {}
    )
  );
}
