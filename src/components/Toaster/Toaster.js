/**
 * This module provides a reusable toaster element component
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
      className={'fonio-toaster ' + status}>
      {log}
    </p>
  );
};

export default Toaster;
