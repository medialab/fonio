/**
 * This module provides a icon button allowing to add/edit assets
 * @module fonio/components/SectionEditor
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { silentEvent } from '../../helpers/misc';

/**
 * Imports Components
 */
import IconBtn from '../IconBtn';

class AssetButton extends Component {
  constructor( props ) {
    super( props );
    this.state = {};
  }
  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        onClick,
        active,
        icon
      },
      context: { t }
    } = this;

    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.SectionEditor' );

    /**
     * Callbacks handlers
     */
    const handleMouseDown = ( event ) => {
      silentEvent( event );
    };

    /**
     * References bindings
     */
    const bindRef = ( btn ) => {
      if ( btn ) {
        this.element = btn.element;
      }
    };
    return (
      <IconBtn
        isColor={ active && 'warning' }
        onMouseDown={ handleMouseDown }
        onClick={ onClick }
        ref={ bindRef }
        data-tip={ translate( 'add an element from your library (shortcut : cmd + l)' ) }
        src={ icon || icons.asset.black.svg }
      />
    );
  }
}

AssetButton.contextTypes = {
  t: PropTypes.func
};

export default AssetButton;
