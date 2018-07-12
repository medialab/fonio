import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class DataUrlProvider extends Component {

  static childContextTypes = {
    getResourceDataUrl: PropTypes.func
  }

  constructor(props) {
    super(props);
  }

  getChildContext = () => ({
    getResourceDataUrl: this.getResourceDataUrl
  })

  getResourceDataUrl = (resource) => {
    const {
      serverUrl,
      storyId,
    } = this.props;
    return `${serverUrl}/static/${storyId}/resources/${resource.id}/${resource.id}.${resource.metadata.ext}`;
  }

  render = () => {
    const {children} = this.props;
    return children;
  }
}
