/**
 * This module provides a reusable Toaster element component
 * @module fonio/components/Toaster
 */
import React from 'react';
import PropTypes from 'prop-types';

import './Toaster.scss';


/**
 * Renders the Toaster component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const Toaster = ({
  status,
  log
}) => {
  return (
    <p
      className={'fonio-Toaster ' + status}>
      {log}
    </p>
  );
};


/**
 * Component's properties types
 */
Toaster.propTypes = {

  /**
   * represents the status class of the toaster ('success', 'processing', 'fail')
   */
  status: PropTypes.string,

  /**
   * represents the text/element to display in the toaster
   */
  log: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export default Toaster;
