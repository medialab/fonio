/* eslint react/jsx-no-bind:0 */

/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/HomeView
 */
import React from 'react';
import PropTypes from 'prop-types';

// import {translateNameSpacer} from '../../../helpers/translateUtils';


/**
 * Renders the component
 * @return {ReactElement} markup
 */
const HomeViewLayout = ({
}/*, context*/) => {
  // namespacing the translation keys
  // const translate = translateNameSpacer(context.t, 'Features.HomeView');
  return (<div>Home</div>);
};


/**
 * Context data used by the component
 */
HomeViewLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};


export default HomeViewLayout;
