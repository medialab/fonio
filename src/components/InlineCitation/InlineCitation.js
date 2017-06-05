/* eslint react/no-set-state: 0 */
/**
 * This module provides a reusable inline citation widget component
 * @module fonio/components/InlineCitation
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../helpers/translateUtils';

import './InlineCitation.scss';

class InlineCitation extends Component {

  static contextTypes = {
    t: PropTypes.func.isRequired,
    citations: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      locator: props.asset.contextualizer && props.asset.contextualizer.locator,
      prefix: props.asset.contextualizer && props.asset.contextualizer.prefix,
      suffix: props.asset.contextualizer && props.asset.contextualizer.suffix,
      optionsVisible: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.asset !== nextProps.asset
      || this.state.locator !== nextState.locator
      || this.state.prefix !== nextState.prefix
      || this.state.suffix !== nextState.suffix
      || this.state.optionsVisible !== nextState.optionsVisible
    );
  }

  toggleMoreOptions = () => {
    this.setState({
      optionsVisible: !this.state.optionsVisible
    });
  }

  render() {
    const {
      children,
      asset,
      onChange,
      onBlur,
      onFocus,
    } = this.props;
    const context = this.context;

    const {
      contextualizer = {},
      contextualizerId,
    } = asset;


    const onLocatorChange = (e) => {
      this.setState({
        locator: e.target.value
      });
    };
    const onPrefixChange = (e) => {
      this.setState({
        prefix: e.target.value
      });
    };
    const onSuffixChange = (e) => {
      this.setState({
        suffix: e.target.value
      });
    };

    const onInputClick = e => {
      onFocus(e);
    };

    const onMoreOptionsClick = e => {
      e.stopPropagation();
      this.toggleMoreOptions();
    };

    const onLocatorBlur = e => {
      const locator = this.state.locator;
      const newContextualizer = {
        ...contextualizer,
        locator
      };
      onChange('contextualizer', contextualizerId, newContextualizer);
      this.toggleMoreOptions();
      onBlur(e);
    };

    const onPrefixBlur = e => {
      const prefix = this.state.prefix;
      const newContextualizer = {
        ...contextualizer,
        prefix
      };
      onChange('contextualizer', contextualizerId, newContextualizer);
      this.toggleMoreOptions();
      onBlur(e);
    };
    const onSuffixBlur = e => {
      const suffix = this.state.suffix;
      const newContextualizer = {
        ...contextualizer,
        suffix
      };
      onChange('contextualizer', contextualizerId, newContextualizer);
      this.toggleMoreOptions();
      onBlur(e);
    };
    const translate = translateNameSpacer(context.t, 'Components.InlineCitation');
    const representation = asset && context.citations && context.citations[asset.id];
    return (
      <span
        className="fonio-inline-citation">
        <span onClick={onMoreOptionsClick}>
          {representation && representation.Component}
        </span>
        <button
          className="more-options-btn"
          onClick={onMoreOptionsClick}>
          +
        </button>
        {this.state.optionsVisible &&
        <span className="more-options-container">
          prefix:
          <input
            placeholder={translate('prefix-placeholder')}
            value={this.state.prefix}
            onChange={onPrefixChange}
            onClick={onInputClick}
            onFocus={onFocus}
            onBlur={onPrefixBlur} />
          locator:
          <input
            placeholder={translate('locator-placeholder')}
            value={this.state.locator}
            onChange={onLocatorChange}
            onFocus={onFocus}
            onClick={onInputClick}
            onBlur={onLocatorBlur} />

          Suffix:
          <input
            placeholder={translate('suffix-placeholder')}
            value={this.state.suffix}
            onChange={onSuffixChange}
            onClick={onInputClick}
            onFocus={onFocus}
            onBlur={onSuffixBlur} />
        </span>}
        {children}

      </span>
    );
  }
}
export default InlineCitation;