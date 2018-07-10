import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
  withRouter,
} from 'react-router';

import {
  summonAsset
} from '../../../helpers/assetsUtils';
import {createResourceData} from '../../../helpers/resourcesUtils';

import * as duck from '../duck';

import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as storyDuck from '../../StoryManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';
import * as libarayViewDuck from '../../LibraryView/duck';

import SectionViewLayout from './SectionViewLayout';

import EditionUiWrapper from '../../EditionUiWrapper/components/EditionUiWrapperContainer';

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
      ...duck,
    }, dispatch)
  })
)

class SectionViewContainer extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    // require lock if edited story is here
    if (this.props.editedStory) {
      this.requireLockOnSection(this.props);
    }
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
      },
    } = nextProps;

    /**
     * @todo skip this conditional with another strategy relying on components architecture
     */
    if (!this.props.editedStory && nextProps.editedStory) {
      this.requireLockOnSection(this.props);
    }

    if (prevSectionId !== nextSectionId || prevStoryId !== nextStoryId) {
      this.unlockOnSection(this.props);
      this.requireLockOnSection(nextProps);
      this.props.actions.setEmbedResourceAfterCreation(false);
      this.props.actions.setNewResourceType(undefined);
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
      userId,
      lockingMap,
    } = props;
    if (lockingMap && lockingMap[storyId] && lockingMap[storyId].locks[userId]) {
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
      this.props.actions.setMainColumnMode('edition');
    })
    .catch((err) => {
      /**
       * @todo handle errors
       */
      console.log('resources fail to upload', err);/* eslint no-console: 0 */
    });
  }

  onSummonAsset = (contentId, resourceId) => summonAsset(contentId, resourceId, this.props);

  embedLastResource = () => {
    const resources = this.props.editedStory.resources;
    const resourcesMap = Object.keys(resources).map(id => resources[id]);
    const lastResource = resourcesMap.sort((a, b) => {
      if (a.metadata.lastUpdateAt > b.metadata.lastUpdateAt) {
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

  render() {
    const {
      props: {
        editedStory,
        match: {
          params: {
            sectionId,
          }
        },
      },
      goToSection,
      onSummonAsset,
      submitMultiResources,
      embedLastResource
    } = this;
    if (editedStory) {
      const section = editedStory.sections[sectionId];
      if (section) {
        return (
          <EditionUiWrapper>
            <SectionViewLayout
              section={section}
              goToSection={goToSection}
              story={this.props.editedStory}
              embedLastResource={embedLastResource}
              summonAsset={onSummonAsset}
              submitMultiResources={submitMultiResources}
              {...this.props} />
          </EditionUiWrapper>
        );
      }
      else return <div>Section does not exist</div>;
    }
    return null;
  }
}

export default withRouter(SectionViewContainer);
