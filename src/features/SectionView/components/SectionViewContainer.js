import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
  withRouter,
} from 'react-router';

import * as duck from '../duck';

import * as connectionsDuck from '../../ConnectionsManager/duck';

import SectionViewLayout from './SectionViewLayout';

@connect(
  state => ({
    ...duck.selector(state.section),
    ...connectionsDuck.selector(state.connections),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...connectionsDuck,
    }, dispatch)
  })
)

class SectionViewContainer extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    this.requireLockOnSection(this.props);
  }

  componentWillReceiveProps = nextProps => {
    /**
     * if section id or story id is changed leave previous section and try to lock on next section
     */
    const {
      match: {
        params: {
          sectionId: prevSectionId,
          storyId: prevStoryId
        }
      }
    } = this.props;
    const {
      match: {
        params: {
          sectionId: nextSectionId,
          storyId: nextStoryId
        }
      }
    } = nextProps;

    if (prevSectionId !== nextSectionId || prevStoryId !== nextStoryId) {
      this.unlockOnSection(this.props);
      this.requireLockOnSection(nextProps);
    }
    /**
     * If section lock is failed/refused,
     * this means another client is editing the section
     * -> for now the UI behaviour is to get back client to the summary view
     */
     if (nextProps.viewLockState === 'fail') {
      nextProps.history.push(`/story/${nextStoryId}/`);
     }
  }

  componentWillUnmount = () => {
    this.unlockOnSection(this.props);
  }

  unlockOnSection = props => {
    const {
      match: {
        params: {
          sectionId,
          storyId
        }
      },
      userId
    } = props;
    this.props.actions.leaveBlock({
      blockId: sectionId,
      storyId,
      userId,
      location: 'sections',
    });
  }

  requireLockOnSection = props => {
    const {
      match: {
        params: {
          sectionId,
          storyId
        }
      },
      userId
    } = props;
    this.props.actions.enterBlock({
      blockId: sectionId,
      storyId,
      userId,
      location: 'sections',
    });
  }


  render() {
    return (
      <SectionViewLayout
        {...this.props} />
    );
  }
}

export default withRouter(SectionViewContainer);
