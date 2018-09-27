/**
 * This module provides a wrapper for converting editor received props
 * into context data for its children
 * @module fonio/components/SectionEditor
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Imports Components
 */
import SectionEditor from './SectionEditor';

export default class SectionEditorWrapper extends Component {

  static childContextTypes = {
    startExistingResourceConfiguration: PropTypes.func,
    startNewResourceConfiguration: PropTypes.func,
    deleteContextualizationFromId: PropTypes.func
  }

  constructor( props ) {
    super( props );
  }

  getChildContext = () => ( {
    startExistingResourceConfiguration: this.props.startExistingResourceConfiguration,
    startNewResourceConfiguration: this.props.startNewResourceConfiguration,
    deleteContextualizationFromId: this.props.deleteContextualizationFromId
  } )

  render = () => {
    const {
      props
    } = this;

    return <SectionEditor { ...props } />;
  }
}
