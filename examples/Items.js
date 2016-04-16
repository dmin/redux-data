import React from 'react';
import locusRedux from '../source/locusRedux';

const Items = ({ items1, items2 }) => (
  <div>
    <h1>Items</h1>
    <h2>Items 1</h2>
    <ul>
      {items1.map((item, i) => <li key={i}>{item.id}: {item.name}</li>)}
    </ul>

    <h2>Items 2</h2>
    <ul>
      {items2.map((item, i) => <li key={i}>{item.id}</li>)}
    </ul>
  </div>
);

Items.propTypes = {
  items1: React.PropTypes.array.isRequired,
  items2: React.PropTypes.array.isRequired,
};

// TODO need to handle mutations
export default locusRedux(Items, {
  queries: {
    // TODO function that validates format/options of queries against schema
    // would be nice to use that function at both build and run time (in dev mode)
    items1: _props => ({
      target: 'items', // TODO { items: 34 } automatically returns a record/not a collection
      select: ['id', 'name'],
      offset: 6,
      limit: 8,
    }),

    items2: _props => ({
      target: 'items', // TODO { items: 34 } automatically returns a record/not a collection
      select: ['id'],
      limit: 4,
    }),
  },

  // commands: {
  //   updateItem: _props => ({
  //     target: 'items',
  //     action: 'update',
  //     // TODO preset: {
  //     //   id: props.params.id,
  //     // },
  //   }),
  // },
});
