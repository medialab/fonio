/* eslint react/prop-types: 0 */

import React from 'react';
import InlineButton from './InlineButton';

export default props => (
  <InlineButton {...props} inlineStyleType="ITALIC">
    {props.iconMap.italic}
  </InlineButton>
);

