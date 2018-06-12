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

  componentWillReceiveProps = nextProps => {
    const {
      userId,
      tempSectionIdToDelete,
      tempSectionToCreate,
      tempSectionsOrder,
      sectionsOrderLockState,
      editedStory: {
        id: storyId,
      },
      actions: {
        leaveBlock,
        createSection,
        deleteSection,
        updateSectionsOrder,
        setNewSectionOpen,
        setSectionsOrderLockState,
        setTempSectionToCreate,
        setTempSectionsOrder,
        setTempSectionIdToDelete,
      }
    } = nextProps;
    // managing section creation, deletion and order change operations
    // all these actions deal with sections order
    // so that we perform them then leave the lock on sections order
    if (sectionsOrderLockState === 'success') {
      // a section is waiting to be created
      if (tempSectionToCreate) {
        createSection({
          section: tempSectionToCreate,
          storyId,
          sectionId: tempSectionToCreate.id
        });
        setNewSectionOpen(false);
        setTempSectionToCreate(undefined);
        leaveBlock({
          storyId,
          userId,
          location: 'sectionsOrder'
        });
        this.goToSection(tempSectionToCreate.id);
      }
      // a section is waiting to be deleted
      if (tempSectionIdToDelete) {
        deleteSection({
          sectionId: tempSectionIdToDelete,
          storyId
        });
        leaveBlock({
          storyId,
          userId,
          location: 'sectionsOrder'
        });
        setTempSectionIdToDelete(undefined);
      }
      // section order is waiting to be changed
      if (tempSectionsOrder) {
        updateSectionsOrder({
          sectionsOrder: tempSectionsOrder,
          storyId
        });
        leaveBlock({
          storyId,
          userId,
          location: 'sectionsOrder'
        });
        setTempSectionsOrder(undefined);
      }
      setSectionsOrderLockState(undefined);
    }
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
