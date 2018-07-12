import {Component} from 'react';
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

  getResourceDataUrl = (data) => {
    const {
      serverUrl,
    } = this.props;
    return `${serverUrl}/static/${data.filePath}`;
  }

  render = () => {
    const {children} = this.props;
    return children;
  }
}
