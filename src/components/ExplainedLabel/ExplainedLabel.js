/**
 * This module provides a reusable label with explanation tooltip
 * @module fonio/components/ExplainedLabel
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  Label,
  HelpPin,
} from 'quinoa-design-library/components/';

const ExplainedLabel = ( {
  title = '',
  explanation
} ) => (
  <Label>
    {title}
    <HelpPin place={ 'right' }>
      {explanation}
    </HelpPin>
  </Label>
);

export default ExplainedLabel;
