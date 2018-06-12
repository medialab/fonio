import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SectionEditor from './SectionEditor';

export default class SectionEditorWrapper extends Component {

  static childContextTypes = {
    startExistingResourceConfiguration: PropTypes.func,
    startNewResourceConfiguration: PropTypes.func,
    deleteContextualization: PropTypes.func
  }

  constructor(props) {
    super(props);
  }

  getChildContext = () => ({
    startExistingResourceConfiguration: this.props.startExistingResourceConfiguration,
    startNewResourceConfiguration: this.props.startNewResourceConfiguration,
    deleteContextualization: this.props.deleteContextualization
  })

  render = () => {
    const {
      props
    } = this;

    return <SectionEditor {...props} />;
  }
}
