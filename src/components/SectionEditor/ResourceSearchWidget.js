/**
 * This module provides a reusable resource search widget component.
 * It displays available resources and allow to search by text input
 * and go up in down with keyboard arrows in the list of search-matching items.
 * @module fonio/components/SectionEditor
 */
/* eslint react/no-set-state: 0 */

/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Column,
  DropdownContent,
  DropdownItem,
  Level,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { getResourceTitle, searchResources } from '../../helpers/resourcesUtils';
import { translateNameSpacer } from '../../helpers/translateUtils';
import { silentEvent } from '../../helpers/misc';

/**
 * Shared variables
 */
const timers = {
  medium: 500
};

/**
 * ResourceSearchWidget class for building react component instances
 */
class ResourceSearchWidget extends Component {

  /**
   * Component's context used properties
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: PropTypes.func.isRequired
  }

  /**
   * Initial state
   */
  state = {

    /**
     * The current search input state
     */
    searchTerm: '',

    /**
     * the currently selected item in the list of available items
     */
    selectedItemIndex: 0,
  }

  /**
   * Executes code just after the component mounted
   */
  componentDidMount() {
    if ( this.input ) {
      setTimeout( () => {
        this.props.onAssetChoiceFocus();
        if ( this.input ) {
          this.input.focus();
        }
      }, timers.medium );
    }
  }

  getFilteredOptions = () => {
    const {
      options = []
    } = this.props;
    const blockAssetTypes = [ 'image', 'table', 'video', 'embed' ];

    /**
     * Computed variables
     */
    const allowedOptions = options.filter( ( option ) => {
      if ( this.props.contentId !== 'main' ) {
        return !blockAssetTypes.includes( option.metadata.type );
      }
      return option;
    } )
    .sort( ( a, b ) => {
      const aD = a.lastUpdateAt || a.createdAt;
      const bD = b.lastUpdateAt || b.createdAt;
      if ( aD > bD ) {
        return -1;
      }
      return 1;
    } );
    const filteredOptions = this.state.searchTerm.length === 0 ? allowedOptions : searchResources( allowedOptions, this.state.searchTerm );
    return filteredOptions;
  }

  /**
   * Callbacks when the search term is changed
   */
  onTermChange = ( e ) => {
    const searchTerm = e.target.value;
    e.stopPropagation();
    this.setState( {
      searchTerm,
      selectedItemIndex: 0
    } );
  }

  /**
   * Callbacks when a key is finished pressing
   */
  onKeyUp = ( e ) => {
    // escape pressed
    if ( e.which === 27 && typeof this.props.onAssetRequestCancel === 'function' ) {
      this.props.onAssetRequestCancel();
    }
    // up arrow
    else if ( e.which === 38 ) {
      let selectedItemIndex = this.state.selectedItemIndex || 0;
      selectedItemIndex = selectedItemIndex > 0 ? selectedItemIndex - 1 : 0;
      this.setState( {
        selectedItemIndex
      } );
    }
    // down arrow
    else if ( e.which === 40 ) {
      let selectedItemIndex = this.state.selectedItemIndex || 0;
      selectedItemIndex = selectedItemIndex < this.props.options.length - 1 ? selectedItemIndex + 1 : this.props.options.length - 1;
      this.setState( {
        selectedItemIndex
      } );

    }
  }

  /**
   * Callbacks when user hits enter while focused in the input.
   */
  onSubmit = ( e ) => {
    silentEvent( e );
    const filteredOptions = this.getFilteredOptions();
    // add an asset
    if ( filteredOptions.length ) {
      const index = this.state.selectedItemIndex || 0;
      this.props.onAssetChoice( filteredOptions[index], this.props.contentId );
    }
  }

  /**
   * Callbacks when user clicks on the input (force focus)
   */
  onInputClick = ( e ) => {
    e.stopPropagation();
    if ( this.input ) {
      this.input.focus();
      this.props.onAssetChoiceFocus();
      setTimeout( () => this.input.focus() );
    }
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render () {

    /**
     * Variables definition
     */
    const {
      onAssetChoice,
      options = []
    } = this.props;
    const context = this.context;

    /**
     * Computed variables
     */
    const filteredOptions = this.getFilteredOptions();

    /**
     * Local functions
     */
    const translate = translateNameSpacer( context.t, 'Components.ResourceSearchWidget' );

    /**
     * Callbacks handlers
     */
    const handleOptionClick = ( option ) => {
      onAssetChoice( option, this.props.contentId );
    };

    /**
     * References bindings
     */
    const bindRef = ( input ) => {
      this.input = input;
    };

    const bindElement = ( element ) => {
      this.element = element;
    };
    const handleBlur = this.onBlur;
    const handleChange = this.onTermChange;
    const handleKeyUp = this.onKeyUp;
    const handleInputClick = this.onInputClick;
    const handleSubmit = this.onSubmit;

    return (
      <div
        ref={ bindElement }
        style={ { paddingLeft: '1rem' } }
        className={ 'fonio-ResourceSearchWidget' }
      >
        <DropdownContent>
          <Column>
            <StretchedLayoutContainer>
              <StretchedLayoutItem>
                <form
                  className={ 'search-form' }
                  onSubmit={ handleSubmit }
                >
                  {/* <span className="arobase">@</span>*/}
                  <input
                    ref={ bindRef }
                    className={ 'input' }
                    value={ this.state.searchTerm }
                    onBlur={ handleBlur }
                    onChange={ handleChange }
                    onKeyUp={ handleKeyUp }
                    onClick={ handleInputClick }
                    placeholder={ translate( 'search-a-resource' ) }
                  />
                </form>
              </StretchedLayoutItem>
              <StretchedLayoutItem isFlex={ 1 }>
                <Level />
                {
              filteredOptions.length > 0 ?

                <div
                  className={ 'choice-options-container' }
                  style={ { maxHeight: '10rem', overflowX: 'hidden', overflowY: 'auto' } }
                >
                  {
                filteredOptions
                .map( ( option, index ) => {
                  const handleClick = () => handleOptionClick( option );
                  let optionName = getResourceTitle( option );
                  const {
                    metadata
                  } = option;

                  /*
                   * if (metadata.type === 'bib') {
                   *   optionName = data[0] && data[0].title && data[0].title.length ? data[0].title : translate('untitled-asset');
                   * }
                   * else if (metadata.type === 'glossary') {
                   *   optionName = data.name && data.name.length ? data.name : translate('untitled-asset');
                   * }
                   * else {
                   *   optionName = metadata.title && metadata.title.length ? metadata.title : translate('untitled-asset');
                   * }
                   */
                  optionName = optionName.length ? optionName : translate( 'untitled-asset' );
                  return (
                    <DropdownItem
                      isFullWidth
                      href={ '#' }
                      isActive={ index === this.state.selectedItemIndex }
                      key={ index }
                      onClick={ handleClick }
                    >
                      <img
                        src={ icons[metadata.type].black.svg }
                        style={ { height: '1em', display: 'inline', paddingRight: '1em' } }
                      />
                      {optionName}
                    </DropdownItem>
                  );
                } )
              }
                </div> :
                <DropdownItem>
                  {options.length ? translate( 'no items matching search' ) : translate( 'add items to your library in order to embed them' )}
                </DropdownItem>
          }
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </Column>
        </DropdownContent>
      </div>
    );
  }
}

/**
 * Component's properties types
 */
ResourceSearchWidget.propTypes = {

  /**
   * Callbacks when an asset is choosen
   */
  onAssetChoice: PropTypes.func,

  /**
   * Overall available options to the component
   */
  options: PropTypes.array,
};

export default ResourceSearchWidget;
