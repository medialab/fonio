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
    startExistingResourceConfiguration: PropTypes.func
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
      onAssetChange,
      onAssetBlur,
      onAssetFocus,
    } = this.props;
    const context = this.context;

    const {
      startExistingResourceConfiguration
    } = context;

    const {
      contextualizer = {},
      contextualizerId,
      resource,
    } = asset;

    const onEditRequest = () => {
      if (typeof startExistingResourceConfiguration === 'function') {
        startExistingResourceConfiguration(resource.metadata.id, resource);
      }
    };

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
      onAssetFocus(e);
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
      onAssetChange('contextualizer', contextualizerId, newContextualizer);
      this.toggleMoreOptions();
      onAssetBlur(e);
    };

    const onPrefixBlur = e => {
      const prefix = this.state.prefix;
      const newContextualizer = {
        ...contextualizer,
        prefix
      };
      onAssetChange('contextualizer', contextualizerId, newContextualizer);
      this.toggleMoreOptions();
      onAssetBlur(e);
    };
    const onSuffixBlur = e => {
      const suffix = this.state.suffix;
      const newContextualizer = {
        ...contextualizer,
        suffix
      };
      onAssetChange('contextualizer', contextualizerId, newContextualizer);
      this.toggleMoreOptions();
      onAssetBlur(e);
    };
    const translate = translateNameSpacer(context.t, 'Components.InlineCitation');
    const representation = asset && context.citations && context.citations[asset.id];
    return (
      <span
        className="fonio-InlineCitation">
        <span onClick={onMoreOptionsClick}>
          {representation && representation.Component}
        </span>
        <button
          className="more-options-btn"
          onClick={onMoreOptionsClick}>
          +
        </button>
        <button
          className="more-options-btn"
          onClick={onEditRequest}>
          ✎
        </button>
        {this.state.optionsVisible &&
        <span className="more-options-container">
          {translate('prefix-label')}:
          <input
            placeholder={translate('prefix-placeholder')}
            value={this.state.prefix}
            onChange={onPrefixChange}
            onClick={onInputClick}
            onFocus={onAssetFocus}
            onBlur={onPrefixBlur} />
          {translate('locator-label')}:
          <input
            placeholder={translate('locator-placeholder')}
            value={this.state.locator}
            onChange={onLocatorChange}
            onFocus={onAssetFocus}
            onClick={onInputClick}
            onBlur={onLocatorBlur} />

          {translate('suffix-label')}:
          <input
            placeholder={translate('suffix-placeholder')}
            value={this.state.suffix}
            onChange={onSuffixChange}
            onClick={onInputClick}
            onFocus={onAssetFocus}
            onBlur={onSuffixBlur} />
        </span>}
        {children}

      </span>
    );
  }
}
export default InlineCitation;
