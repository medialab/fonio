import React, {Component} from 'react';

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
      resource = {},
    } = asset;

    return (<AssetPreview
      type={resource.metadata && resource.metadata.type}
      data={resource.data} />);
  }
}
export default BlockContainer;
