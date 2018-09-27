
/**
 * This module provides a section title preview/edition for the section edition view
 * @module fonio/features/SectionView
 */

/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import {
  Title,
  Button,
  Icon,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import {
  abbrevString,
  silentEvent
} from '../../../helpers/misc';

class SectionHeader extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      title: props.value || '',
      isFocused: false
    };
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.state.title !== nextProps.title ) {
      this.setState( {
        title: nextProps.title
      } );
    }
  }

  onFocus = () => {
    if ( typeof this.props.onFocus === 'function' ) {
      this.props.onFocus( this.state.title );
    }
    this.setState( {
      isFocused: true
    } );
  }
  onBlur = () => {
    if ( typeof this.props.onBlur === 'function' ) {
      this.props.onBlur( this.state.title );
    }
    this.setState( {
      isFocused: false
    } );
  }

  onChange = ( e ) => {
    const value = e.target.value;
    this.setState( {
      title: value,
    } );
  }
  render = () => {

    /**
     * Variables definition
     */
    const {
      state: {
        title,
        isFocused,
      },
      props: {
        onEdit,
        isDisabled,
        isColor,
        editTip,
        placeHolder,
        inputTip,
      },
      onFocus,
      onBlur,
      onChange,
    } = this;

    /**
     * Callbacks handlers
     */
    const handleSubmit = ( e ) => {
      silentEvent( e );
      if ( this.input ) {
        this.input.blur();
      }
    };

    /**
     * References bindings
     */
    const bindInput = ( input ) => {
      this.input = input;
    };
    return (
      <form
        onSubmit={ handleSubmit }
        style={ { overflow: 'visible', position: 'relative' } }
      >
        <Title

          style={ { marginBottom: 0 } }
          isSize={ 2 }
        >
          <input
            style={ {
              fontSize: 'inherit',
              width: '100%',
              fontWeight: 'inherit',
              border: 'none',
              outline: 'none',
              paddingLeft: '1rem',
            } }
            data-tip={ inputTip }
            data-for={ 'tooltip' }
            data-effect={ 'solid' }
            data-place={ 'bottom' }
            ref={ bindInput }
            value={ isFocused ? title : abbrevString( title, 30 ) }
            onFocus={ onFocus }
            onBlur={ onBlur }
            onChange={ onChange }
            placeholder={ placeHolder }
          />
        </Title>
        <Button
          isRounded
          onClick={ onEdit }
          data-tip={ editTip }
          data-for={ 'tooltip' }
          isColor={ isColor }
          isDisabled={ isDisabled }
          style={ {
            position: 'absolute',
            left: '-4rem',
            top: 0,
            transition: 'all .5s ease',
            opacity: isFocused ? 1 : 0,
            // pointerEvents: isFocused ? 'all' : 'none'
          } }
        >
          <Icon>
            <img src={ icons.edit.black.svg } />
          </Icon>
        </Button>
      </form>
    );
  }
}

export default SectionHeader;
