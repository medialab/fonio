/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the stories manager feature interface
 * @module fonio/features/StoriesManager
 */
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {get} from 'superagent';
import {setLanguage} from 'redux-i18n';

import StoriesManagerLayout from './StoriesManagerLayout';
import * as duck from '../duck';
import * as editorDuck from '../../StoryEditor/duck';
import * as globalUiDuck from '../../GlobalUi/duck';
import {maxNumberOfLocalStories} from '../../../../config';

import {
  getFileAsText
} from '../../../helpers/fileLoader';

import validateStory from '../../../helpers/storyValidator';

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
    this.importFromDistantJSON = this.importFromDistantJSON.bind(this);
    this.attemptImport = this.attemptImport.bind(this);
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
      const valid = validateStory(project);
      if (valid) {
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
   * Tries to import a new story from a url
   * @param {event} e - initial click event (wtf ?)
   */
  importFromDistantJSON (e) {
    // todo: should this be wrapped in a promise-based action ?
    e.preventDefault();
    const url = this.props.importFromUrlCandidate;
    // case : the user is trying to fetch a gist
    if (url.indexOf('https://gist.github.com') === 0) {
      const matchId = url.match(/([^/]+)$/);
      if (matchId && matchId[1]) {
        const gistId = matchId[1];
        const entryUrl = 'https://api.github.com/gists/' + gistId;
        return get(entryUrl)
        .end((err, res) => {
          if (err) {
            return this.props.actions.importFail('invalidUrl');
          }
          try {
            const info = JSON.parse(res.text);
            if (info.files && info.files['project.json']) {
              const rawUrl = info.files['project.json'].raw_url;
              return get(rawUrl)
              .end((rawErr, rawRes) => {
                if (rawErr) {
                  return this.props.actions.importFail('fetchError');
                }
                this.attemptImport(rawRes.text);
              });
            }
            else {
              return this.props.actions.importFail('invalidGist');
            }
          }
          catch (parseError) {
            return this.props.actions.importFail('invalidUrl');
          }
        });
      }
      else {
        return this.props.actions.importFail('invalidUrl');
      }
    }
    // case plain url (supposedly to a json restory of a project)
    get(url)
    .end((err, res) => {
      if (err) {
        this.props.actions.importFail('invalidUrl');
      }
      else if (res.type === 'application/json') {
        this.attemptImport(res.text);
      }
    });
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
        maxNumberOfLocalStories={maxNumberOfLocalStories}
        onDropInput={this.onProjectImportPrompt}
        overrideImportWithCandidate={overrideImportWithCandidate}
        importFromDistantJSON={this.importFromDistantJSON}
        {...this.props} />
    );
  }
}

