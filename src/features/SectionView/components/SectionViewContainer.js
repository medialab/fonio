import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import SectionViewLayout from './SectionViewLayout';

@connect(
  state => ({
  }),
  dispatch => ({
    actions: bindActionCreators({
    }, dispatch)
  })
)

class SectionViewContainer extends Component {

  constructor(props) {
    super(props);
  }


  render() {
    return (
      <SectionViewLayout
        {...this.props} />
    );
  }
}

export default withRouter(SectionViewContainer);
