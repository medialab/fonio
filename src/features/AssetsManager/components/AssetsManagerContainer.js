/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the assets manager feature interface
 * @module fonio/features/AssetsManager
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {v4 as uuid} from 'uuid';
// import { DraggableDecorator } from 'draft-js-dnd-plugin';

import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';
import {unpromptAssetEmbed} from '../../Editor/duck';

import AssetsManagerLayout from './AssetsManagerLayout';

/**
 * Redux-decorated component class rendering the assets manager feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.assetsManager),
    ...managerDuck.selector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      unpromptAssetEmbed
    }, dispatch)
  })
)
class AssetsManagerContainer extends Component {
  /**
   * constructor
   */
  constructor(props) {
    super(props);
    this.createAsset = this.createAsset.bind(this);
    this.updateAsset = this.updateAsset.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  createAsset(asset) {
    const id = uuid();
    const {
      activeStoryId
    } = this.props;
    this.props.actions.createAsset(activeStoryId, id, {
      ...asset,
      metadata: {
        ...asset.metadata,
        id
      }
    });
  }
  updateAsset(id, asset) {
    const {
      activeStoryId
    } = this.props;
    this.props.actions.updateAsset(activeStoryId, id, asset);
  }


  render() {
    const assetsSearchQuery = this.props.assetsSearchQuery;
    let assets = this.props.activeStory.assets;
    if (assets) {
      const selectedAssetsIds = this.props.selectedAssets;
      assets = Object.keys(assets)
      .filter(assetKey => {
        if (selectedAssetsIds && selectedAssetsIds.length) {
         return selectedAssetsIds.indexOf(assetKey) > -1;
        }
        else return true;
      })
      .map(id => ({...this.props.activeStory.assets[id], id}))
      .filter(asset => {
        if (assetsSearchQuery && assetsSearchQuery.length) {
          return JSON.stringify(asset.metadata).toLowerCase().indexOf(assetsSearchQuery.toLowerCase()) > -1;
        }
        else return true;
      });
    }
    return (
      <AssetsManagerLayout
        {...this.props}
        assets={assets}
        createAsset={this.createAsset}
        updateAsset={this.updateAsset} />
    );
  }
}

export default AssetsManagerContainer;
