/* eslint react/no-set-state: 0 */
/**
 * This module provides a reusable inline citation widget component
 * @module fonio/components/InlineCitation
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../helpers/translateUtils';

import './GlossaryMention.scss';

class GlossaryMention extends Component {

  static contextTypes = {
    t: PropTypes.func.isRequired,
    citations: PropTypes.object,
    startExistingResourceConfiguration: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      alias: props.asset.contextualizer && props.asset.contextualizer.alias,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.asset !== nextProps.asset
      || this.state.alias !== nextState.alias
    );
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

    const onAliasChange = (e) => {
      this.setState({
        alias: e.target.value
      });
    };

    const onInputClick = e => {
      onAssetFocus(e);
    };

    const onAliasBlur = e => {
      const alias = this.state.alias;
      const newContextualizer = {
        ...contextualizer,
        alias
      };
      onAssetChange('contextualizer', contextualizerId, newContextualizer);
      onAssetBlur(e);
    };
    const translate = translateNameSpacer(context.t, 'Components.GlossaryMention');
    return (
      <span
        className="fonio-GlossaryMention">
        <input
          placeholder={translate('alias-placeholder')}
          value={this.state.alias && this.state.alias.length ? this.state.alias : resource.data.name}
          onChange={onAliasChange}
          onClick={onInputClick}
          onFocus={onAssetFocus}
          onBlur={onAliasBlur} />

        <button
          className="more-options-btn"
          onClick={onEditRequest}>
          ✎
        </button>
        {children}
      </span>
    );
  }
}
export default GlossaryMention;
