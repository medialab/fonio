/**
 * This module provides a reusable pin that points to a tooltip
 * @module fonio/components/HelpPin
 */
import React from 'react';
import PropTypes from 'prop-types';

import './HelpPin.scss';


/**
 * Renders the HelpPin component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
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

/**
 * Component's properties types
 */
HelpPin.propTypes = {

  /**
   * Children of the component
   */
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),

  /**
   * The position class of the pin (left, right, top, bottom)
   */
   position: PropTypes.string
};

export default HelpPin;
