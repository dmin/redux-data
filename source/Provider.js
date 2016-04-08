import React from 'react';
import locus from './locus.js';

export default class Provider extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.store = locus(props.schema);
  }
  
  getChildContext() {
    return { store: this.store };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

Provider.propTypes = {
  schema: React.PropTypes.object.isRequired,
  children: React.PropTypes.element.isRequired,
};

Provider.childContextTypes = {
  store: React.PropTypes.object.isRequired,
};
