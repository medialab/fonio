/**
 * This module provides a reusable Toaster element component
 * @module fonio/components/Toaster
 */
import React from 'react';

import './Spinner.scss';


/**
 * Renders the Toaster component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const Spinner = () => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
    </div>
  );
};

export default Spinner;
