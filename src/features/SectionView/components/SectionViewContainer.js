import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {v4 as genId} from 'uuid';
import {
  withRouter,
} from 'react-router';

import {
  convertToRaw
} from 'draft-js';

import config from '../../../config';

import {
  summonAsset,
  deleteUncitedContext
} from '../../../helpers/assetsUtils';

import {
  getUserResourceLockId,
} from '../../../helpers/lockUtils';

import {createResourceData, validateFiles} from '../../../helpers/resourcesUtils';
// import {translateNameSpacer} from '../../../helpers/translateUtils';
import {createDefaultResource} from '../../../helpers/schemaUtils';

import UploadModal from '../../../components/UploadModal';
import PastingModal from '../../../components/PastingModal';

import DataUrlProvider from '../../../components/DataUrlProvider';

import * as duck from '../duck';

import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as storyDuck from '../../StoryManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';
import * as libarayViewDuck from '../../LibraryView/duck';
import * as errorMessageDuck from '../../ErrorMessageManager/duck';

import SectionViewLayout from './SectionViewLayout';

import EditionUiWrapper from '../../EditionUiWrapper/components/EditionUiWrapperContainer';

const {maxBatchNumber} = config;

@connect(
  state => ({
    ...connectionsDuck.selector(state.connections),
    ...storyDuck.selector(state.editedStory),
    ...sectionsManagementDuck.selector(state.sectionsManagement),
    ...libarayViewDuck.selector(state.library),
    ...duck.selector(state.section),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...connectionsDuck,
      ...storyDuck,
      ...sectionsManagementDuck,
      ...libarayViewDuck,
      ...errorMessageDuck,
      ...duck,
    }, dispatch)
  })
)

class SectionViewContainer extends Component {

  static childContextTypes = {
    setDraggedResourceId: PropTypes.func,
    setLinkModalFocusId: PropTypes.func,
    editorFocus: PropTypes.string,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.confirmExit = this.confirmExit.bind(this);
  }

  getChildContext = () => ({
    setDraggedResourceId: this.setDraggedResourceId,
    setLinkModalFocusId: this.setLinkModalFocusId,
    editorFocus: this.props.editorFocus,
  })


  componentDidMount = () => {
    window.addEventListener('beforeunload', this.confirmExit);
    // require lock if edited story is here
    if (this.props.editedStory) {
      this.requireLockOnSection(this.props);
    }
    this.props.actions.resetDraftEditorsStates();
    this.props.actions.setEditedSectionId(this.props.match.params.sectionId);
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
      },
      editorStates,
      userId,
    } = this.props;
    const {
      match: {
        params: {
          sectionId: nextSectionId,
          storyId: nextStoryId
        }
      },
      pendingContextualization,
      editedStory
    } = nextProps;

    /**
     * @todo skip this conditional with another strategy relying on components architecture
     */
    if (!this.props.editedStory && nextProps.editedStory) {
      this.requireLockOnSection(this.props);
    }
    // changing section
    if (prevSectionId !== nextSectionId || prevStoryId !== nextStoryId) {
      // updating active section id
      this.props.actions.setEditedSectionId(nextSectionId);
      // packing up : saving all last editor states
      const section = this.props.editedStory.sections[prevSectionId];
      const newSection = {
        ...section,
        contents: editorStates[prevSectionId] ? convertToRaw(editorStates[prevSectionId].getCurrentContent()) : section.contents,
        notes: Object.keys(section.notes || {}).reduce((result, noteId) => ({
          ...result,
          [noteId]: {
            ...section.notes[noteId],
            contents: editorStates[noteId] ? convertToRaw(editorStates[noteId].getCurrentContent()) : section.notes[noteId].contents,
          }
        }), {})
      };
      this.props.actions.updateSection({
        sectionId: prevSectionId,
        storyId: prevStoryId,
        userId,
        section: newSection
      });
      this.unlockOnSection(this.props);
      this.requireLockOnSection(nextProps);
      this.props.actions.resetDraftEditorsStates();
      this.props.actions.setEmbedResourceAfterCreation(false);
      this.props.actions.setNewResourceType(undefined);
      this.props.actions.setEditedSectionId(undefined);
    }

    if (pendingContextualization) {
      const {
        resourceId,
        contentId
      } = pendingContextualization;
      if (editedStory && editedStory.resources && editedStory.resources[resourceId]) {
        nextProps.actions.setPendingContextualization(undefined);
        setTimeout(() => {
          this.onSummonAsset(contentId, resourceId);
          nextProps.actions.setLinkModalFocusId(undefined);
        });
      }
    }
  }

  // componentWillUpdate = () => {
  //   console.time('container update time');/* eslint no-console: 0 */
  // }

  // componentDidUpdate = () => {
  //   console.timeEnd('container update time');/* eslint no-console: 0 */
  // }

  componentWillUnmount = () => {
    this.unlockOnSection(this.props);
    this.props.actions.setEditedSectionId(undefined);
    this.props.actions.resetDraftEditorsStates();
  }

  confirmExit(e) {
    const {storyIsSaved} = this.props;
    if (!storyIsSaved) {
      const confirmationMessage = '\o/';
      e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
      return confirmationMessage;
    }
  }

  setDraggedResourceId = resourceId => {
    this.props.actions.setDraggedResourceId(resourceId);
  }

  setLinkModalFocusId = (focusId) => {
    this.props.actions.setLinkModalFocusId(focusId);
  }


  unlockOnSection = props => {
    const {
      match: {
        params: {
          sectionId,
          storyId
        }
      },
      userId,
      lockingMap,
    } = props;
    if (lockingMap && lockingMap[storyId] && lockingMap[storyId].locks[userId]) {
      deleteUncitedContext(sectionId, props);
      this.props.actions.leaveBlock({
        blockId: sectionId,
        storyId,
        userId,
        blockType: 'sections',
      });
    }
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
      blockType: 'sections',
    }, (err) => {
      if (err) {
        /**
         * ENTER_BLOCK_FAIL
         * If section lock is failed/refused,
         * this means another client is editing the section
         * -> for now the UI behaviour is to get back client to the summary view
         */
        this.props.history.push(`/story/${storyId}/`);
      }
      else {
        // ENTER_BLOCK_SUCCESS
        // this.goToSection(sectionId);
      }
    });
  }

  goToSection = sectionId => {
    const {
      editedStory: {
        id
      }
    } = this.props;
    this.props.history.push(`/story/${id}/section/${sectionId}`);
  }

  submitMultiResources = (files) => {
    this.props.actions.setUploadStatus({
      status: 'initializing',
      errors: []
    });
    setTimeout(() => {
      const {setErrorMessage} = this.props.actions;
      if (files.length > maxBatchNumber) {
        setErrorMessage({type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'Too many files uploaded'});
        return;
      }
      const validFiles = validateFiles(files);
      if (validFiles.length === 0) {
        setErrorMessage({type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'No valid files to upload'});
        return;
      }
      if (validFiles.length < files.length) {
        const invalidFiles = files.filter(f => validFiles.find(oF => oF.name === f.name) === undefined);
        this.props.actions.setUploadStatus({
          ...this.props.uploadStatus,
          errors: invalidFiles.map(file => ({
            fileName: file.name,
            reason: 'too big'
          }))
        });
        setErrorMessage({type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'Some files larger than maximum size'});
      }
      const errors = [];
      validFiles.reduce((curr, next) => {
        return curr.then(() => {
          this.props.actions.setUploadStatus({
            status: 'uploading',
            currentFileName: next.name,
            errors: this.props.uploadStatus.errors
          });
          return createResourceData(next, this.props)
          .then((res) => {
            if (res && !res.success) errors.push(res);
          });
        });
      }, Promise.resolve())
      .then(() => {
        if (errors.length > 0) {
          setErrorMessage({type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: errors});
        }
        this.props.actions.setMainColumnMode('edition');
        this.props.actions.setUploadStatus(undefined);
      })
      .catch((error) => {
        this.props.actions.setUploadStatus(undefined);
        setErrorMessage({type: 'SUBMIT_MULTI_RESOURCES_FAIL', error});
      });
    }, 100);

  }

  onSummonAsset = (contentId, resourceId) => summonAsset(contentId, resourceId, this.props);

  onCreateHyperlink = ({title, url}, contentId) => {
    const {
      match: {
        params: {
          storyId,
        }
      },
      userId,
      actions: {
        createResource,
      }
    } = this.props;
    const id = genId();
    const resource = {
      ...createDefaultResource(),
      id,
      metadata: {
        type: 'webpage',
        createdAt: new Date().getTime(),
        lastModifiedAt: new Date().getTime(),
        title,
      },
      data: {
        url,
      }
    };
    createResource({
      resourceId: id,
      storyId,
      userId,
      resource
    });
    this.props.actions.setPendingContextualization({
      resourceId: id,
      contentId
    });
  }

  onContextualizeHyperlink = (resourceId, contentId) => {
    this.onSummonAsset(contentId, resourceId);
    this.props.actions.setLinkModalFocusId(undefined);
  }

  embedLastResource = () => {
    const resources = this.props.editedStory.resources;
    const resourcesMap = Object.keys(resources).map(id => resources[id]);
    const lastResource = resourcesMap.sort((a, b) => {
      if (a.lastUpdateAt > b.lastUpdateAt) {
        return -1;
      }
      else {
        return 1;
      }
    })[0];
    if (lastResource) {
      this.onSummonAsset(this.props.assetRequestState.editorId, lastResource.id);
    }
  }

  onResourceEditAttempt = resourceId => {
    const {
      match: {
        params: {
          storyId
        }
      },
      lockingMap,
      userId
    } = this.props;
    const userLockedResourceId = getUserResourceLockId(lockingMap, userId, storyId);
    if (userLockedResourceId !== resourceId) {
      this.props.actions.enterBlock({
        storyId,
        userId,
        blockType: 'resources',
        blockId: resourceId
      });
    }
  };

  render() {
    const {
      props: {
        editedStory,
        uploadStatus,
        match: {
          params: {
            sectionId,
            storyId,
          }
        },
        editorPastingStatus,
      },
      goToSection,
      onSummonAsset,
      onContextualizeHyperlink,
      onCreateHyperlink,
      submitMultiResources,
      embedLastResource,
      onResourceEditAttempt,
      // context: {t},
    } = this;
    // const translate = translateNameSpacer(t, 'Features.SectionViewContainer');

    if (editedStory) {
      const section = editedStory.sections[sectionId];
      if (section) {
        return (
          <DataUrlProvider storyId={storyId} serverUrl={config.apiUrl} >
            <EditionUiWrapper>
              <SectionViewLayout
                section={section}
                goToSection={goToSection}
                story={this.props.editedStory}
                embedLastResource={embedLastResource}
                summonAsset={onSummonAsset}
                submitMultiResources={submitMultiResources}
                onCreateHyperlink={onCreateHyperlink}
                onContextualizeHyperlink={onContextualizeHyperlink}
                onResourceEditAttempt={onResourceEditAttempt}
                {...this.props} />
              <PastingModal editorPastingStatus={editorPastingStatus} />
              <UploadModal uploadStatus={uploadStatus} />
            </EditionUiWrapper>
          </DataUrlProvider>
        );
      }
      else return <div>Section does not exist</div>;
    }
    return null;
  }
}

export default withRouter(SectionViewContainer);
