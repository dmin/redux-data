import React from 'react';
import { connect } from '../source/index';

const Items = ({ items1, items2, firstItem, firstItemCached }) => {
  return (
    <div>
      <h1>First Item</h1>
      <p>{firstItem.name}</p>

      <h1>First Item Cached</h1>
      <p>{firstItemCached.name}</p>

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
};

Items.propTypes = {
  items1: React.PropTypes.array.isRequired,
  items2: React.PropTypes.array.isRequired,
  firstItem: React.PropTypes.object.isRequired,
  firstItemCached: React.PropTypes.object.isRequired,
};

export default connect(Items, {
  queries: {
    items1: _props => ({
      target: 'items',
      select: ['id', 'name'],
      // where: { name: 'Lug' }, // TODO Should offset be ignored when the total number of records found is less that the offset? At the very least give a warning
      offset: 6,
      limit: 8,
    }),

    items2: _props => ({
      target: 'items', // TODO { items: 34 } automatically returns a record/not a collection
      select: ['id'],
      where: { name: 'Plate' },
      limit: 4,
    }),

    firstItem: _props => ({
      target: 'items',
      where: { id: '7' },
      transform: 'first',
    }),

    firstItemCached: _props => ({
      target: 'items',
      where: { id: '7' },
      transform: 'first',
    }),
  },
});
