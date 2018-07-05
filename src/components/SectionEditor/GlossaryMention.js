/* eslint react/no-set-state: 0 */
/**
 * This module provides a reusable inline glossary mention component
 * @module fonio/components/GlossaryMention
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Input from 'react-input-autosize';

import {
  Button,
  Image
} from 'quinoa-design-library/components';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {translateNameSpacer} from '../../helpers/translateUtils';


/**
 * GlossaryMention class for building react component instances
 */
class GlossaryMention extends Component {

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
      alias: props.asset.contextualizer && props.asset.contextualizer.alias,
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
      || this.state.alias !== nextState.alias
    );
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
        startExistingResourceConfiguration(resource.id, resource);
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
    return resource ? (
      <span
        className="fonio-GlossaryMention">
        <span className="items-container">
          <Input
            className="input"
            placeholder={translate('alias-placeholder')}
            value={this.state.alias && this.state.alias.length ? this.state.alias : resource.data.name}
            onChange={onAliasChange}
            onClick={onInputClick}
            onFocus={onAssetFocus}
            onBlur={onAliasBlur} />

          <Button
            className="more-options-btn"
            onClick={onEditRequest}>
            <Image isSize={'16x16'} src={icons.glossary.black.svg} />
            <Image isSize={'16x16'} src={icons.edit.black.svg} />
          </Button>
          {children}
        </span>
      </span>
    ) : null;
  }
}


/**
 * Component's properties types
 */
GlossaryMention.propTypes = {

  /**
   * Children react elements of the component
   */
  children: PropTypes.array,

  /**
   * The asset to consume for displaying the glossary mention
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

export default GlossaryMention;
