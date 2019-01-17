/**
 * This module provides a toolbar button for h1 modifier
 * @module fonio/components/SectionEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import BlockButton from './BlockButton';

export default ( props ) => (
  <BlockButton
    { ...props }
    blockType={ 'header-one' }
  >
    {props.iconMap.h1}
  </BlockButton>
);
