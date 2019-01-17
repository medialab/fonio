/**
 * This module provides a toolbar button for blockquote modifier
 * @module fonio/components/SectionEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import BlockButton from './BlockButton';

export default ( props ) => (
  <BlockButton
    { ...props }
    blockType={ 'blockquote' }
  >
    {props.iconMap.quoteblock}
  </BlockButton>
);
