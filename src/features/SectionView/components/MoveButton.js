/**
 * This module provides a mini component for representing move possibility
 * @module fonio/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  Button,
  Icon
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

const MoveButton = ( {

} ) => (
  <Button
    style={ { pointerEvents: 'none' } }
    data-place={ 'left' }
    data-effect={ 'solid' }
    data-for={ 'tooltip' }
  >
    <Icon>
      <img src={ icons.move.black.svg } />
    </Icon>
  </Button>
);

export default MoveButton;
