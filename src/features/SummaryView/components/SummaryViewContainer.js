import React, {Component} from 'react';
// import {bindActionCreators} from 'redux';
// import {connect} from 'react-redux';

import AuthWrapper from '../../AuthManager/components/AuthManagerContainer';

import SummaryViewLayout from './SummaryViewLayout';

// @connect(
//   state => ({
//   }),
//   dispatch => ({
//     actions: bindActionCreators({
//     }, dispatch)
//   })
// )
class SummaryViewContainer extends Component {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate = () => true;

  render() {
    return (
      <AuthWrapper>
        <SummaryViewLayout
          {...this.props} />
      </AuthWrapper>
    );
  }
}

export default SummaryViewContainer;
