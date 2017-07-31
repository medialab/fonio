/**
 * This module provides a reusable block contextualization for the editor component
 * @module fonio/components/SectionEditor
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import AssetPreview from '../AssetPreview/AssetPreview';


/**
 * BlockContainer class for building react component instances
 */
class BlockContainer extends Component {


  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
  }


  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize here
    return true;
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      asset,
    } = this.props;

    const {
      startExistingResourceConfiguration
    } = this.context;

    const {
      resource = {},
    } = asset;

    const onEditRequest = () => {
      if (typeof startExistingResourceConfiguration === 'function') {
        startExistingResourceConfiguration(resource.metadata.id, resource);
      }
    };


    return (<AssetPreview
      type={resource.metadata && resource.metadata.type}
      data={resource.data}
      metadata={resource.metadata}
      onEditRequest={onEditRequest}
      showPannel />);
  }
}

/**
 * Component's properties types
 */
BlockContainer.propTypes = {
  /*
   * the asset to render
   */
  asset: PropTypes.shape({
    resource: PropTypes.object,
  })
};


/**
 * Component's context used properties
 */
BlockContainer.contextTypes = {

  /**
   * Callbacks when resource configuration is asked from
   * within the asset component
   */
  startExistingResourceConfiguration: PropTypes.func
};
export default BlockContainer;
