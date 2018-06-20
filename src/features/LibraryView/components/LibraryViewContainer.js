import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {csvParse} from 'd3-dsv';
import {v4 as genId} from 'uuid';

import LibraryViewLayout from './LibraryViewLayout';

import * as duck from '../duck';
import * as editedStoryDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';

import {validate, createDefaultResource} from '../../../helpers/schemaUtils';
import {loadImage, inferMetadata, parseBibTeXToCSLJSON} from '../../../helpers/assetsUtils';
import {getFileAsText} from '../../../helpers/fileLoader';

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

  createResourceData = (file) =>
    new Promise((resolve, reject) => {
      const {
        userId,
        editedStory: story,
      } = this.props;
      const {
        id: storyId
      } = story;
      const id = genId();
      const extension = file.name.split('.').pop();
      let metadata;
      let data;
      let type;
      let resource;
      let payload;
      switch (extension) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
          type = 'image';
          return loadImage(file)
            .then((base64) => {
              data = {base64};
              metadata = inferMetadata({...data, file}, type);
              resource = {
                id,
                metadata: {
                  ...metadata,
                  type,
                },
                data,
              };
              payload = {
                resourceId: id,
                resource,
                storyId,
                userId,
              };
              return this.props.actions.uploadResource(payload, 'create');
            })
            .then(() => resolve({id, success: true}))
            .catch(() => resolve({id, success: false}));
        case 'csv':
        case 'tsv':
          type = 'table';
          return getFileAsText(file)
            .then((text) => {
              data = {json: csvParse(text)};
              metadata = inferMetadata({...data, file}, type);
              resource = {
                id,
                metadata: {
                  ...metadata,
                  type,
                },
                data,
              };
              payload = {
                resourceId: id,
                resource,
                storyId,
                userId,
              };
              return this.props.actions.uploadResource(payload, 'create');
            })
            .then(() => resolve({id, success: true}))
            .catch(() => resolve({id, success: false}));
        default:
          return getFileAsText(file)
            .then((text) => {
              data = parseBibTeXToCSLJSON(text);
              data.forEach(datum => {
                resource = {
                  ...createDefaultResource(),
                  id: genId(),
                  metadata: {
                    ...createDefaultResource().metadata,
                    type: 'bib',
                  },
                  data: [datum],
                };
                payload = {
                  resourceId: id,
                  resource,
                  storyId,
                  userId,
                };
                return this.props.actions.createResource(payload);
              });
            })
            .then(() => resolve({id, success: true}))
            .catch(() => resolve({id, success: false}));
      }
    });


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
        this.createResourceData(next)
        .then((res) => {
          if (res && !res.success) errors.push(res);
        })
      );
    }, Promise.resolve())
    .then(() => {
      if (errors.length > 0) {
        console.log(errors);
        console.log("resource fail to upload");
      }
    })
    .catch((err) => {
      console.log("resources fail to upload");
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
