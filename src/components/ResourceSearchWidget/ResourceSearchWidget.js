/* eslint react/no-set-state: 0 */
/**
 * This module provides a reusable resource search widget component
 * @module fonio/components/ResourceSearchWidget
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../helpers/translateUtils';

import './ResourceSearchWidget.scss';

class ResourceSearchWidget extends Component {
  static contextTypes = {
    t: PropTypes.func.isRequired
  }

  state = {
    searchTerm: '',
    selectedItemIndex: 0
  }

  componentDidMount() {
    if (this.input) {
      setTimeout(() => {
        this.input.focus();
      }, 300);
    }
  }

  onTermChange = (e) => {
    const searchTerm = e.target.value;
    e.stopPropagation();
    this.setState({
      searchTerm,
      selectedItemIndex: 0
    });
  }

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

  onInputClick = e => {
    e.stopPropagation();
    if (this.input) {
      setTimeout(() => {
        this.input.focus();
      }, 1);
    }
  }

  render () {
    const {
      onAssetChoice,
      options = []
    } = this.props;
    const context = this.context;

    const onOptionClick = option => {
      onAssetChoice(option, this.props.contentId);
    };
    const bindRef = input => {
      this.input = input;
    };
    const translate = translateNameSpacer(context.t, 'Components.ResourceSearchWidget');
    return (
      <div className="fonio-resource-search-widget">
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
              return (<li
                className={'choice-option' + (index === this.state.selectedItemIndex ? ' active' : '')}
                key={index}
                onClick={onC}>{option.metadata.title}</li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}


export default ResourceSearchWidget;
