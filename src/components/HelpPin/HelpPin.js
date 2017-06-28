/**
 * This module provides a reusable pin that points to a tooltip
 * @module fonio/components/HelpPin
 */
import React from 'react';


import './HelpPin.scss';

const HelpPin = ({
  children,
  position
}) => (
  <span
    className={'fonio-HelpPin ' + (position || '')}>
    <span className="pin-icon">
      ?
    </span>

    <div className="pin-content-container">
      {children}
    </div>
  </span>
);

export default HelpPin;
