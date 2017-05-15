/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the editor feature interface
 * @module fonio/features/Editor
 */
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setLanguage} from 'redux-i18n';

import {debounce} from 'lodash';

import EditorLayout from './EditorLayout';
import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';

import {
  resetStoryCandidateSettings,
  setupStoryCandidate
} from '../../ConfigurationDialog/duck';

import {
  updateAsset,
  embedAsset
} from '../../AssetsManager/duck';

import {
  insertAssetInEditor
} from '../../../helpers/draftUtils';

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.fonioEditor),
    ...managerDuck.selector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      resetStoryCandidateSettings,
      setupStoryCandidate,
      updateAsset,
      embedAsset,
      setLanguage
    }, dispatch)
  })
)
class EditorContainer extends Component {

  static contextTypes = {
    t: React.PropTypes.func.isRequired,
    store: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.closeAndResetDialog = this.closeAndResetDialog.bind(this);
    this.returnToLanding = this.returnToLanding.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.updateStoryContent = this.updateStoryContent.bind(this);
    this.embedAsset = this.embedAsset.bind(this);

    this.updateStoryContentDebounced = debounce(this.updateStoryContentDebounced, 1000);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.activeStory && this.props.activeStory.content && this.props.activeStory.content !== nextProps.activeStory.content) {
      return false;
    }
    return true;
  }

  closeAndResetDialog() {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.closeStoryCandidateModal();
  }

  returnToLanding() {
    this.props.actions.unsetActiveStory();
  }

  openSettings () {
    this.props.actions.startStoryCandidateConfiguration(this.props.activeStory);
  }

  updateStoryContentDebounced (id, content) {
    this.props.actions.serializeStoryContent(id, content);
  }

  updateStoryContent (id, content) {
    this.props.actions.updateStoryContent(id, content);
    this.updateStoryContentDebounced(id, content);
  }

  embedAsset (editor, id, assetId, metadata, atSelection) {
    const editorState = insertAssetInEditor(editor, metadata, atSelection);
    this.props.actions.updateStoryContent(this.props.activeStoryId, editorState);
    this.updateStoryContentDebounced(this.props.activeStoryId, editorState);
  }

  render() {
    return (
      <EditorLayout
        {...this.props}
        openSettings={this.openSettings}
        closeAndResetDialog={this.closeAndResetDialog}
        returnToLanding={this.returnToLanding}
        updateStoryContent={this.updateStoryContent}
        embedAsset={this.embedAsset} />
    );
  }
}

export default EditorContainer;
