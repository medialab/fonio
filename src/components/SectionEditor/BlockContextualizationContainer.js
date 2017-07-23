import React, {Component} from 'react';
import PropTypes from 'prop-types';

import AssetPreview from '../AssetPreview/AssetPreview';

class BlockContainer extends Component {
  constructor(props) {
    super(props);
  }


  shouldComponentUpdate() {
    return true;
  }

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

BlockContainer.contextTypes = {
  startExistingResourceConfiguration: PropTypes.func
};
export default BlockContainer;
