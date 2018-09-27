/**
 * This module provides a language toggling button
 * @module fonio/components/LanguageToggler
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLanguage } from 'redux-i18n';

import {
  Button,
} from 'quinoa-design-library/components/';

@connect(
  ( state ) => ( {
    lang: state.i18nState.lang,
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      setLanguage,
    }, dispatch )
  } )
)
class LanguageToggler extends Component {

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

    /**
     * Variables definition
     */
    const {
      lang,
      actions: {
        setLanguage: doSetLanguage
      }
    } = this.props;

    /**
     * Computed variables
     */
    const otherLang = lang === 'fr' ? 'en' : 'fr';

    /**
     * Callbacks handlers
     */
    const handleClick = () => {
      doSetLanguage( otherLang );
    };

    return (
      <Button
        onClick={ handleClick }
        className={ 'button' }
      >
        {lang}
        <span style={ { opacity: 0.5 } }>/{otherLang}</span>
      </Button>
    );
  }
}

export default LanguageToggler;
