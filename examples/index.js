import React from 'react';
import { render } from 'react-dom';

import Provider from '../source/Provider';
import schema from './schema';
import Items from './Items';

render(
  <Provider schema={schema}>
    <Items />
  </Provider>,
  window.document.getElementById('react')
);
