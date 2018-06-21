import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import LibraryViewLayout from './LibraryViewLayout';

import * as duck from '../duck';
import * as editedStoryDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';

import {createResourceData} from '../../../helpers/resourcesUtils';

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

  submitMultiResources = (files) => {
    // return new Promise((resolve, reject) => {
    //   const resourcesPromise = files.map(file => this.submitUploadResourceData(file));
    //   return Promise.all(resourcesPromise.map(p => p.catch(e => e)))
    //     .then(res => resolve(res.filter(result => !result.success)))
    //     .catch(err => reject(err));
    // });
    const errors = [];
    files.reduce((curr, next) => {
      return curr.then(() =>
        createResourceData(next, this.props)
        .then((res) => {
          if (res && !res.success) errors.push(res);
        })
      );
    }, Promise.resolve())
    .then(() => {
      if (errors.length > 0) {
        console.error(errors);/* eslint no-console: 0 */
        /**
         * @todo handle errors
         */
        console.log('resource fail to upload');/* eslint no-console: 0 */
      }
    })
    .catch((err) => {
      /**
       * @todo handle errors
       */
      console.log('resources fail to upload', err);/* eslint no-console: 0 */
    });
  }

  render() {
    return this.props.editedStory ?
          (
            <EditionUiWrapper>
              <LibraryViewLayout
                {...this.props}
                submitMultiResources={this.submitMultiResources} />
            </EditionUiWrapper>
          )
          : null;
  }
}

export default LibraryViewContainer;
