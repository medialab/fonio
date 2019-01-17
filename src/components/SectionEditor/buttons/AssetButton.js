/**
 * This module provides a icon button allowing to add/edit assets
 * @module fonio/components/SectionEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

const AssetButton = ( {
  onClick,
  active,
  iconMap,
  message,
  ...otherProps
} ) => {
  const onMouseDown = ( event ) => event.preventDefault();
  return (
    <div
      className={ `scholar-draft-AssetButton${active ? ' active' : ''}` }
      onMouseDown={ onMouseDown }
      onClick={ onClick }
      data-for={ 'icon-btn-tooltip' }
      data-tip={ message }
      { ...otherProps }
    >
      {iconMap.asset}
      <ReactTooltip
        place={ active ? 'left' : 'right' }
      />
    </div>
  );
};

AssetButton.propTypes = {

  active: PropTypes.bool,

  iconMap: PropTypes.object,

  message: PropTypes.string,

  onClick: PropTypes.func,

};

export default AssetButton;
