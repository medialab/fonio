/* eslint react/no-set-state: 0 */
/* eslint  react/prefer-stateless-function : 0 */

/**
 * This module provides a reusable inline citation widget component
 * @module fonio/components/LinkContextualization
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

// import {translateNameSpacer} from '../../helpers/translateUtils';

class LinkContextualization extends Component {

  static contextTypes = {
    t: PropTypes.func.isRequired,
    // citations: PropTypes.object,
    // startExistingResourceConfiguration: PropTypes.func
  }
  render = () => {
    const {
      children,
    } = this.props;

    return (
      <span
        style={{color: 'blue', position: 'relative'}}>
        {children}
      </span>
    );
  }
}


/**
 * Component's properties types
 */
LinkContextualization.propTypes = {

  /**
   * Children react elements of the component
   */
  children: PropTypes.array,

  /**
   * The asset to consume for displaying the inline citation
   */
  asset: PropTypes.object,

  /**
   * Callbacks when an asset is changed
   */
  onAssetChange: PropTypes.func,

  /**
   * Callbacks when an asset is blured
   */
  onAssetBlur: PropTypes.func,

  /**
   * Callbacks when an asset is focused
   */
  onAssetFocus: PropTypes.func,
};

export default LinkContextualization;
