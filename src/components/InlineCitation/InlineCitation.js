/* eslint react/no-set-state: 0 */
/**
 * This module provides a reusable inline citation widget component
 * @module fonio/components/InlineCitation
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../helpers/translateUtils';

import './InlineCitation.scss';


/**
 * InlineCitation class for building react component instances
 */
class InlineCitation extends Component {

  /**
   * Component's context used properties
   */
  static contextTypes = {
    t: PropTypes.func.isRequired,
    citations: PropTypes.object,
    startExistingResourceConfiguration: PropTypes.func
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.state = {
      locator: props.asset.contextualizer && props.asset.contextualizer.locator,
      prefix: props.asset.contextualizer && props.asset.contextualizer.prefix,
      suffix: props.asset.contextualizer && props.asset.contextualizer.suffix,
      optionsVisible: false
    };
  }


  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.asset !== nextProps.asset
      || this.state.locator !== nextState.locator
      || this.state.prefix !== nextState.prefix
      || this.state.suffix !== nextState.suffix
      || this.state.optionsVisible !== nextState.optionsVisible
    );
  }


  /**
   * Opens the contextualization's details definition ui
   */
  toggleMoreOptions = () => {
    this.setState({
      optionsVisible: !this.state.optionsVisible
    });
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
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
        <span className="items-container">
        <span onClick={onMoreOptionsClick}>
          {representation && representation.Component}
        </span>

        <button
            className="more-options-btn"
            onClick={onEditRequest}>
          <img src={require('../../sharedAssets/bib-black.svg')} />
          <img src={require('../../sharedAssets/edit-black.svg')} />
        </button>
        <button
          className="more-options-btn"
          onClick={onMoreOptionsClick}>
          <img style={{transform: 'rotate(45deg)'}} src={require('../../sharedAssets/close-black.svg')} />
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
      </span>
    );
  }
}

/**
 * Component's properties types
 */
InlineCitation.propTypes = {

  /**
   * Children react elements of the component
   */
  children: PropTypes.array,

  /**
   * The asset to consume for displaying the inline citation
   */
  asset: PropTypes.object,

  /**
   * Callbacks when an asset is changed
   */
  onAssetChange: PropTypes.func,

  /**
   * Callbacks when an asset is blured
   */
  onAssetBlur: PropTypes.func,

  /**
   * Callbacks when an asset is focused
   */
  onAssetFocus: PropTypes.func,
};

export default InlineCitation;
