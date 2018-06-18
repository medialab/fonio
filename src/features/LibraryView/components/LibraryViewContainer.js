import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import LibraryViewLayout from './LibraryViewLayout';

import * as duck from '../duck';
import * as editedStoryDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';

import EditionUiWrapper from '../../EditionUiWrapper/components/EditionUiWrapperContainer';

@connect(
  state => ({
    ...duck.selector(state.library),
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
class LibraryViewContainer extends Component {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate = () => true;

  /**
   * Leave locked blocks when leaving the view
   */
  componentWillUnmount = () => {
    this.leaveLockedBlocks();
  }

  leaveLockedBlocks = () => {
    const {
      userId,
      editedStory: story,
      lockingMap,
      actions: {
        leaveBlock
      }
    } = this.props;
    const {
      id: storyId
    } = story;

    const locks = lockingMap[storyId].locks;
    const userLocks = locks[userId];

    if (userLocks && userLocks.resources) {
      leaveBlock({
        storyId,
        userId,
        blockType: 'resources',
        blockId: userLocks.resources.blockId
      });
    }
  }


  render() {
    return this.props.editedStory ?
          (
            <EditionUiWrapper>
              <LibraryViewLayout
                {...this.props} />
            </EditionUiWrapper>
          )
          : null;
  }
}

export default LibraryViewContainer;
