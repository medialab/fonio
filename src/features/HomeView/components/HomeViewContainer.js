/**
 * This module provides a connected component for handling the home view
 * @module fonio/features/HomeView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLanguage } from 'redux-i18n';
import { withRouter } from 'react-router';

/**
 * Imports Project utils
 */
import { getEditionHistoryMap } from '../../../helpers/localStorageUtils';

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as userInfoDuck from '../../UserInfoManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as authDuck from '../../AuthManager/duck';
import * as editionDuck from '../../EditionUiWrapper/duck';
import * as errorMessageDuck from '../../ErrorMessageManager/duck';

/**
 * Imports Components
 */
import HomeViewLayout from './HomeViewLayout';

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  ( state ) => ( {
    ...editionDuck.selector( state.editionUiWrapper ),
    ...duck.selector( state.home ),
    lang: state.i18nState.lang,
    ...userInfoDuck.selector( state.userInfo ),
    ...connectionsDuck.selector( state.connections ),
    ...authDuck.selector( state.auth ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editionDuck,
      ...userInfoDuck,
      ...connectionsDuck,
      ...authDuck,
      ...errorMessageDuck,
      ...duck,
      setLanguage,
    }, dispatch )
  } )
)
class HomeViewContainer extends Component {

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
  constructor( props ) {
    super( props );
  }

  componentWillMount() {
    this.props.actions.fetchStories();
    const editionHistoryMap = getEditionHistoryMap();
    this.props.actions.setEditionHistory( editionHistoryMap );
    this.props.actions.setStoryLoginId( undefined );
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
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <HomeViewLayout
        { ...this.props }
      />
    );
  }
}

export default withRouter( HomeViewContainer );
