import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import LibraryViewLayout from './LibraryViewLayout';

import * as duck from '../duck';
import * as editedStoryDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';
import * as errorMessageDuck from '../../ErrorMessageManager/duck';

import {createResourceData} from '../../../helpers/resourcesUtils';

import EditionUiWrapper from '../../EditionUiWrapper/components/EditionUiWrapperContainer';
import DataUrlProvider from '../../../components/DataUrlProvider';

import config from '../../../config';

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
      ...errorMessageDuck,
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
    const {setErrorMessage} = this.props.actions;
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
        setErrorMessage({type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: errors});
      }
    })
    .catch((error) => {
      setErrorMessage({type: 'SUBMIT_MULTI_RESOURCES_FAIL', error});
    });
  }

  render() {
    return this.props.editedStory ?
          (
            <DataUrlProvider storyId={this.props.editedStory.id} serverUrl={config.apiUrl} >
              <EditionUiWrapper>
                <LibraryViewLayout
                  {...this.props}
                  submitMultiResources={this.submitMultiResources} />
              </EditionUiWrapper>
            </DataUrlProvider>
          )
          : null;
  }
}

export default LibraryViewContainer;
