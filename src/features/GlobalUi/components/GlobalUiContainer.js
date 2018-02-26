/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the interface container
 * @module fonio/features/GlobalUi
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setLanguage} from 'redux-i18n';
import {withRouter} from 'react-router';

import GlobalUiLayout from './GlobalUiLayout';
import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';

import {
  resetStoryCandidateSettings,
} from '../../ConfigurationDialog/duck';

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.globalUi),
    ...managerDuck.selector(state.stories),
    lang: state.i18nState.lang,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      ...managerDuck,
      resetStoryCandidateSettings,
      setLanguage,
    }, dispatch)
  })
)
class GlobalUiContainer extends Component {

  /**
   * Context data used by the component
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: PropTypes.func.isRequired,

    /**
     * Redux store
     */
    store: PropTypes.object.isRequired
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.closeAndResetDialog = this.closeAndResetDialog.bind(this);
    this.closeLoginDialog = this.closeLoginDialog.bind(this);
  }


  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize when the feature is stabilized
    return true;
  }


  /**
   * Closes story configuration modal and resets story candidate
   */
  closeAndResetDialog() {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.closeStoryCandidateModal();
  }

  /**
   * Closes story login modal and redirect route
   */
  closeLoginDialog() {
    this.props.actions.closeLoginModal();
    this.props.history.push({
      pathname: '/'
    });
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <GlobalUiLayout
        {...this.props}
        closeAndResetDialog={this.closeAndResetDialog}
        closeLoginDialog={this.closeLoginDialog} />
    );
  }
}

export default withRouter(GlobalUiContainer);
