/**
 * This module provides a component allowing to edit raw bibtex data.
 * It handles errors and propagates an update only if input data is valid.
 * @module fonio/components/AuthorsManager
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CodeEditor
} from 'quinoa-design-library';
import Cite from 'citation-js';

class BibRefsEditor extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      refsInput: '',
    };
  }
  componentDidMount = () => {
    this.updateBibInput( this.props.data );
  }
  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.data !== nextProps.data ) {
      this.updateBibInput( nextProps.data );
    }
  }

  updateBibInput = ( data ) => {
    const resAsBibTeXParser = new Cite( data );
    const resAsBibTeX = resAsBibTeXParser.get( { type: 'string', style: 'bibtex' } );
    if ( resAsBibTeX !== this.state.refsInput ) {
      this.setState( {
        refsInput: resAsBibTeX
      } );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      onChange,
      style,
    } = this.props;
    const { refsInput } = this.state;

    /**
     * Callbacks handlers
     */
    const handleBibTeXInputChange = ( value ) => {
      this.setState( {
        refsInput: value,
      } );
      onChange( value );
    };

    return (
      <div
        style={ style }
      >
        <CodeEditor
          onChange={ handleBibTeXInputChange }
          value={ refsInput }
        />
      </div>
    );
  }
}

BibRefsEditor.contextTypes = {
  t: PropTypes.func,
};
export default BibRefsEditor;
