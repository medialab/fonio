/**
 * This module provides a reusable dropzone component
 * @module fonio/components/DropZone
 */
import React from 'react';
import Dropzone from 'react-dropzone';

import './DropZone.scss';

const DropZone = ({
  onDrop,
  children,
  accept
}) => (
  <Dropzone
    className="fonio-DropZone"
    activeClassName="active"
    accept={accept}
    onDrop={onDrop}>
    {({isDragActive, isDragReject}) => (
      <div className={'caption-wrapper ' + (isDragActive ? 'active ' : ' ') + (isDragReject ? 'reject' : '')}>
        <div className="caption-container">{children}</div>
      </div>
    )}
  </Dropzone>
);

export default DropZone;
