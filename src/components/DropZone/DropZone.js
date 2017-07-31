/**
 * This module provides a reusable dropzone component.
 * It is basically the drop zone module component given a class
 * in order to style all drop zones consistently.
 * @module fonio/components/DropZone
 */
import React from 'react';
import Dropzone from 'react-dropzone';

import './DropZone.scss';


/**
 * Renders the DropZone component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
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


/**
 * Component's properties types
 */
DropZone.propTypes = {

};

export default DropZone;
