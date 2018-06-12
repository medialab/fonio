import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import SummaryViewLayout from './SummaryViewLayout';

import * as duck from '../duck';
import * as editedStoryDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';

@connect(
  state => ({
    ...duck.selector(state.summary),
    ...editedStoryDuck.selector(state.editedStory),
    ...connectionsDuck.selector(state.connections),
    ...sectionsManagementDuck.selector(state.sectionsManagement),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...connectionsDuck,
      ...editedStoryDuck,
      ...sectionsManagementDuck,
      ...duck
    }, dispatch)
  })
)
class SummaryViewContainer extends Component {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate = () => true;

  componentWillUnmount = () => {
    /**
     * Leave metadata if it was locked
     */
    const {
      lockingMap,
      userId,
      editedStory: {
        id
      },
      actions: {
        leaveBlock
      }
    } = this.props;
    const userLockedOnMetadataId = lockingMap[id] && lockingMap[id].locks &&
      Object.keys(lockingMap[id].locks)
        .find(thatUserId => lockingMap[id].locks[thatUserId].storyMetadata !== undefined);
    if (userLockedOnMetadataId && userLockedOnMetadataId === userId) {
      leaveBlock({
        storyId: id,
        userId,
        location: 'storyMetadata',
      });
    }
  }

  goToSection = sectionId => {
    const {
      editedStory: {
        id
      }
    } = this.props;
    this.props.history.push(`/story/${id}/section/${sectionId}`);
  }

  render() {
    return this.props.editedStory
      && this.props.editedStory.metadata ?
          (<SummaryViewLayout
            {...this.props}
            goToSection={this.goToSection} />)
          : null;
  }
}

export default SummaryViewContainer;
