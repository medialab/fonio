/* eslint react/no-set-state: 0 */
/**
 * This module provides a reusable resource search widget component.
 * It displays available resources and allow to search by text input
 * and go up in down with keyboard arrows in the list of search-matching items.
 * @module fonio/components/ResourceSearchWidget
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import config from '../../../config';
const {timers} = config;

import {translateNameSpacer} from '../../helpers/translateUtils';

import './ResourceSearchWidget.scss';


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
    if (this.input) {
      setTimeout(() => {
        this.props.onAssetChoiceFocus();
        this.input.focus();
      }, timers.medium);
    }
  }


  /**
   * Callbacks when the search term is changed
   */
  onTermChange = (e) => {
    const searchTerm = e.target.value;
    e.stopPropagation();
    this.setState({
      searchTerm,
      selectedItemIndex: 0
    });
  }


  /**
   * Callbacks when a key is finished pressing
   */
  onKeyUp = e => {
    // escape pressed
    if (e.which === 27 && typeof this.props.onAssetRequestCancel === 'function') {
      this.props.onAssetRequestCancel();
    }
    // up arrow
    else if (e.which === 38) {
      let selectedItemIndex = this.state.selectedItemIndex || 0;
      selectedItemIndex = selectedItemIndex > 0 ? selectedItemIndex - 1 : 0;
      this.setState({
        selectedItemIndex
      });
    }
    // down arrow
    else if (e.which === 40) {
      let selectedItemIndex = this.state.selectedItemIndex || 0;
      selectedItemIndex = selectedItemIndex < this.props.options.length - 1 ? selectedItemIndex + 1 : this.props.options.length - 1;
      this.setState({
        selectedItemIndex
      });

    }
  }


  /**
   * Callbacks when user hits enter while focused in the input.
   */
  onSubmit = e => {
    e.stopPropagation();
    e.preventDefault();
    const matching = this.props.options
            .filter(option => JSON.stringify(option).toLowerCase().indexOf(this.state.searchTerm.toLowerCase()) > -1);
    // add an asset
    if (matching.length) {
      this.props.onAssetChoice(matching[(this.state.selectedItemIndex || 0)], this.props.contentId);
    }
    // else interpret input as text to insert within contents
   else {
      this.props.addPlainText('@' + this.state.searchTerm, this.props.contentId);
    }
  }


  /**
   * Callbacks when user clicks on the input (force focus)
   */
  onInputClick = e => {
    e.stopPropagation();
    if (this.input) {
      this.input.focus();
      this.props.onAssetChoiceFocus();
      setTimeout(() => this.input.focus());
    }
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render () {
    const {
      onAssetChoice,
      addNewResource,
      options = []
    } = this.props;
    const context = this.context;

    const onOptionClick = option => {
      onAssetChoice(option, this.props.contentId);
    };

    const onAddNewClick = () => {
      addNewResource();
    };
    const bindRef = input => {
      this.input = input;
    };
    const translate = translateNameSpacer(context.t, 'Components.ResourceSearchWidget');
    return (
      <div className="fonio-ResourceSearchWidget">
        <form className="search-form" onSubmit={this.onSubmit}>
          <span className="arobase">@</span>
          <input
            ref={bindRef}
            value={this.state.searchTerm}
            onBlur={this.onBlur}
            onChange={this.onTermChange}
            onKeyUp={this.onKeyUp}
            onClick={this.onInputClick}
            placeholder={translate('search-a-resource')} />
        </form>
        <ul className="choice-options-container">
          {
            options
            .filter(option => JSON.stringify(option).toLowerCase().indexOf(this.state.searchTerm.toLowerCase()) > -1)
            .map((option, index) => {
              const onC = () => onOptionClick(option);
              let optionName;
              const {
                data,
                metadata
              } = option;
              if (metadata.type === 'bib') {
                optionName = data[0] && data[0].title && data[0].title.length ? data[0].title : translate('untitled-asset');
              }
              else if (metadata.type === 'glossary') {
                optionName = data.name && data.name.length ? data.name : translate('untitled-asset');
              }
              else {
                optionName = metadata.title && metadata.title.length ? metadata.title : translate('untitled-asset');
              }
              return (<li
                className={'choice-option' + (index === this.state.selectedItemIndex ? ' active' : '')}
                key={index}
                onClick={onC}>{optionName}</li>
              );
            })
          }
        </ul>
        <li className="choice-option new-option" onClick={onAddNewClick}>+ new resource</li>
      </div>
    );
  }
}

/**
 * Component's properties types
 */
ResourceSearchWidget.propTypes = {

  /**
   * Overall available options to the component
   */
  options: PropTypes.array,

  /**
   * Callbacks when an asset is choosen
   */
  onAssetChoice: PropTypes.func,
};

export default ResourceSearchWidget;
