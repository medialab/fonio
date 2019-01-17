/**
 * This module provides a toolbar button for h2 modifier
 * @module fonio/components/SectionEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import BlockButton from './BlockButton';

export default ( props ) => (
  <BlockButton
    { ...props }
    blockType={ 'header-two' }
  >
    {props.iconMap.h2}
  </BlockButton>
);
