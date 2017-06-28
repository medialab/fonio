/**
 * This module provides a reusable Toaster element component
 * @module fonio/components/Toaster
 */
import React from 'react';

import './Toaster.scss';

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

export default Toaster;
