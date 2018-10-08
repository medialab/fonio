/**
 * This module provides an aside button for note adding
 * @module fonio/components/SectionEditor
 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

const NoteButton = ( {
  onClick,
  iconMap,
  message,
  ...otherProps
} ) => {

  const onMouseDown = ( event ) => event.preventDefault();

  return (
    <div
      className={ 'scholar-draft-NoteButton' }
      onClick={ onClick }
      onMouseDown={ onMouseDown }
      data-tip={ message }
      { ...otherProps }
    >
      {iconMap.note}
      <ReactTooltip
        place={ 'right' }
      />
    </div>
  );
};

NoteButton.propTypes = {
  iconMap: PropTypes.object,
  message: PropTypes.string,
  onClick: PropTypes.func,
};

export default NoteButton;
