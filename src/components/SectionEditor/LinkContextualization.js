/* eslint react/no-set-state: 0 */
/**
 * This module provides a reusable inline citation widget component
 * @module fonio/components/LinkContextualization
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Input from 'react-input-autosize';

import {translateNameSpacer} from '../../helpers/translateUtils';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {
  Image,
  Tag
} from 'quinoa-design-library/components';


/**
 * LinkContextualization class for building react component instances
 */
class LinkContextualization extends Component {

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
      resource = {},
    } = asset;

    // const {
    //   data
    // } = resource;

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

    // const onLinkClick = e => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   window.open(resource.data, '_newtab');
    // };

    const translate = translateNameSpacer(context.t, 'Components.LinkContextualization');
    return (
      <Tag
        isColor="dark"
        className="is-rounded">
        <span className="items-container">
          <Input
            placeholder={translate('alias-placeholder')}
            value={this.state.alias && this.state.alias.length ? this.state.alias : resource.metadata.title || ''}
            onChange={onAliasChange}
            onClick={onInputClick}
            onFocus={onAssetFocus}
            onBlur={onAliasBlur} />
          <Tag
            isSize="small" className="is-clickable is-rounded" isColor={'dark'}
            onClick={onEditRequest}>
            <Image isSize={'16x16'} src={icons.webpage.black.svg} />
          </Tag>
          {children}
        </span>
      </Tag>
    );
  }
}

/**
 * Component's properties types
 */
LinkContextualization.propTypes = {

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

export default LinkContextualization;
