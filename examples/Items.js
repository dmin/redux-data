import React from 'react';
import connect from '../source/connect';

const Items = ({ items }) => (
  <ul>
    {items.map((item, i) => <li key={i}>{item.name}</li>)}
  </ul>
);

Items.propTypes = {
  items: React.PropTypes.array.isRequired,
};

// TODO need to handle mutations
export default connect(Items, {
  items: _props => ({
    target: 'items', // TODO { items: 34 } automatically returns a record/not a collection
    select: ['name'],
    limit: 10,
  }),
});
