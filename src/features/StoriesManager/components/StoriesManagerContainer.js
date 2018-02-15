/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the stories manager feature interface
 * @module fonio/features/StoriesManager
 */
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setLanguage} from 'redux-i18n';

import StoriesManagerLayout from './StoriesManagerLayout';
import * as duck from '../duck';
import * as editorDuck from '../../StoryEditor/duck';
import * as globalUiDuck from '../../GlobalUi/duck';

import {
  getFileAsText
} from '../../../helpers/fileLoader';

import {validateStory} from '../../../helpers/schemaUtils';

/**
 * Redux-decorated component class rendering the stories manager feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.stories),
    ...editorDuck.selector(state.storyEditor),
    ...globalUiDuck.selector(state.globalUi),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      ...editorDuck,
      ...globalUiDuck,
      setLanguage
    }, dispatch)
  })
)
export default class StoriesManagerContainer extends Component {

  /**
   * Context data used by the component
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: React.PropTypes.func.isRequired,

    /**
     * Redux store
     */
    store: PropTypes.object.isRequired
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor (props) {
    super(props);
    this.onProjectImportPrompt = this.onProjectImportPrompt.bind(this);
    this.attemptImport = this.attemptImport.bind(this);
  }

  componentWillMount() {
    this.props.actions.fetchAllStories();
    this.props.actions.unsetActiveStory();
  }
  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize when the feature is stabilized
    return true;
  }


  /**
   * Tries to import a new story presented as a string
   * @param {string} str - a possibly valid story as a string
   */
  attemptImport (str) {
    // 1. parse the string as json
    try {
      const project = JSON.parse(str);
      // 2. verify it is properly formatted
      const validation = validateStory(project);
      if (validation.valid) {
        // 3. seek if adding the story would
        // override an existing story (which has the same id)
        const existant = this.props.storiesList.find(pres => pres.id === project.id);
        // has preexisting story, prompt for override
        if (existant !== undefined) {
          this.props.actions.promptOverrideImport(project);
        }
        // has no preexisting story, importing
        else {
          this.props.actions.importSuccess(project);
        }
      }
      else {
        this.props.actions.importFail('invalidProject');
      }
    }
    catch (e) {
      this.props.actions.importFail('badJSON');
    }
  }

  /**
   * callbacks when story files are dropped
   * to the import zone.
   * @param {array<File>} files - the files being dropped
   */
  onProjectImportPrompt (files) {
    if (!files || !files.length) {
      return;
    }
    getFileAsText(files[0], (err, str) => {
      // todo : remove
      if (err) {
        this.props.actions.importFail('invalidProject');
      }
      else {
        this.attemptImport(str);
      }
    });
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render () {
    const overrideImportWithCandidate = () => this.props.actions.importSuccess(this.props.importCandidate);
    return (
      <StoriesManagerLayout
        onDropInput={this.onProjectImportPrompt}
        overrideImportWithCandidate={overrideImportWithCandidate}
        importFromDistantJSON={this.importFromDistantJSON}
        {...this.props} />
    );
  }
}

