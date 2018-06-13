import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {toastr} from 'react-redux-toastr';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import * as duck from '../duck';

@connect(
  state => ({
    ...duck.selector(state.connections),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
    }, dispatch)
  })
)
class ToasterContainer extends Component {

  static contextTypes = {
    t: PropTypes.func,
    store: PropTypes.object,
  }

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.lastLockFail !== nextProps.lastLockFail) {
      const translate = translateNameSpacer(this.context.t, 'Features.ToasterContainer');

      let title;
      if (nextProps.lastLockFail.mode === 'enter') {
        switch (nextProps.lastLockFail.location) {
          case 'sections':
            title = translate('You could not edit a section');
            break;
          case 'storyMetadata':
            title = translate('You could not edit story metadata');
            break;
          case 'sectionsOrder':
            title = translate('You could not edit the order of sections');
            break;
          case 'design':
            title = translate('You could not edit the story design');
            break;
          default:
            title = translate('You could not edit a block');
            break;
        }
      }
      if (nextProps.lastLockFail.mode === 'delete') {
        switch (nextProps.lastLockFail.location) {
          case 'sections':
            title = translate('You could not delete a section');
            break;
          case 'resources':
            title = translate('You could not delete a resource');
            break;
          default:
            title = translate('You could not delete a block');
            break;
        }
      }
      const lockedUser = nextProps.activeUsers[nextProps.lastLockFail.userId];
      const message = translate('It is edited by {a}', {a: lockedUser && lockedUser.name});

      toastr.error(title, message);
    }
  }

  render() {
    const {
      props: {
        children,
      },
    } = this;
    return (
      <div>
        {children}
      </div>
    );
  }
}

export default ToasterContainer;
