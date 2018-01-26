/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the takeway dialog feature interface
 * @module fonio/features/TakeAwayDialog
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import {get} from 'superagent';

import * as duck from '../duck';
import {
  selector as editorSelector,
} from '../../StoryEditor/duck';
import {
  selector as globalUiSelector,
  closeTakeAwayModal,
} from '../../GlobalUi/duck';

import {
  selector as storiesSelector,
  updateStory,
  saveStory,
  fetchStoryBundle,
} from '../../StoriesManager/duck';

import downloadFile from '../../../helpers/fileDownloader';
import {
  // bundleProjectAsHtml,
  bundleProjectAsJSON,
  // cleanStoryForExport,
  convertStoryToMarkdown,
} from '../../../helpers/projectBundler';

import {
  githubTokenProviderUrl,
  githubAPIClientId,
  serverUrl
} from '../../../../secrets';

import TakeAwayDialogLayout from './TakeAwayDialogLayout';


/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.takeAway),
    ...globalUiSelector(state.globalUi),
    ...editorSelector(state.storyEditor),
    ...storiesSelector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      closeTakeAwayModal,
      saveStory,
      updateStory,
      fetchStoryBundle
    }, dispatch)
  })
)
class TakeAwayDialogContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.takeAway = debounce(this.takeAway.bind(this), 300);
    this.updateActiveStoryFromServer = this.updateActiveStoryFromServer.bind(this);
    this.updateActiveStoryFromGist = this.updateActiveStoryFromGist.bind(this);
  }


  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize the component when sabilized
    return true;
  }


  /**
   * Fetches active story data from the server
   * and merge it with locally-stored story.
   */
  updateActiveStoryFromServer() {
    // todo : rewrite that as a promise-based action
    this.props.actions.updateStory(this.props.activeStory.id);
    // this.props.actions.setExportToServerStatus('processing', 'updating from the distant server');
    // const url = this.props.activeStory.metadata.serverJSONUrl;
    // get(url)
    //   .end((err, res) => {
    //     if (err) {
    //       return this.props.actions.setExportToServerStatus('failure', 'connection with distant server has failed');
    //     }
    //     try {
    //       const project = JSON.parse(res.text);
    //       this.props.actions.updateStory(project.id, project);
    //       this.props.actions.setExportToServerStatus('success', 'your story is now synchronized with the forccast server');
    //     }
    //     catch (e) {
    //       this.props.actions.setExportToServerStatus('failure', 'The distant version is badly formatted');
    //     }
    //   });
  }


  /**
   * Fetches active story data from gist
   * and merge it with locally-stored story.
   */
  updateActiveStoryFromGist() {
    // todo : rewrite that as an action
    const gistId = this.props.activeStory.metadata.gistId;
    const entryUrl = 'https://api.github.com/gists/' + gistId;
    return get(entryUrl)
    .end((err, res) => {
      if (err) {
        return this.props.actions.setExportToGistStatus('failure', 'The gist could not be retrieved');
      }
      try {
        const info = JSON.parse(res.text);
        if (info.files && info.files['project.json']) {
          const rawUrl = info.files['project.json'].raw_url;
          return get(rawUrl)
          .end((rawErr, rawRes) => {
            if (rawErr) {
              return this.props.actions.setExportToGistStatus('failure', 'The gist could not be retrieved');
            }
            try {
              const project = JSON.parse(rawRes.text);
              // TODO: updataStory not work here
              this.props.actions.updateStory(project.id, project);
              this.props.actions.setExportToGistStatus('success', 'your story is now synchronized with the gist repository');
            }
            catch (parseError) {
              this.props.actions.setExportToGistStatus('failure', 'The gist project file was badly formatted');
            }
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


  /**
   * Wraps the different options for taking the story away,
   * launching proper actions or directly using proper utils
   * @param {string} takeAway - the take away method that is asked
   */
  takeAway(takeAwayType) {
    const title = this.props.activeStory.metadata.title;
    switch (takeAwayType.id) {
      case 'project':
        this.props.actions.fetchStoryBundle(this.props.activeStory.id, 'json')
        .then(res => {
          if (res.result) {
            const JSONbundle = bundleProjectAsJSON(res.result); // bundleProjectAsJSON(this.props.activeStory);
            downloadFile(JSONbundle, 'json', title);
          }
        });
        break;
      case 'markdown':
        this.props.actions.fetchStoryBundle(this.props.activeStory.id, 'json')
        .then(res => {
          if (res.result) {
            const markdownRep = convertStoryToMarkdown(res.result);
            downloadFile(markdownRep, 'md', title);
          }
        });
        break;
      case 'html':
        this.props.actions.fetchStoryBundle(this.props.activeStory.id, 'html')
        .then(res => {
          if (res.result) {
            downloadFile(res.result, 'html', title);
          }
        });
        // this.props.actions.setTakeAwayType('html');
        // this.props.actions.setBundleHtmlStatus('processing', 'Asking the server to bundle a custom html file');
        // bundleProjectAsHtml(this.props.activeStory, (err, html) => {
        //   this.props.actions.setTakeAwayType(undefined);
        //   if (err === null) {
        //     downloadFile(html, 'html', title);
        //     this.props.actions.setBundleHtmlStatus('success', 'Bundling is a success !');
        //   }
        //   else {
        //     this.props.actions.setBundleHtmlStatus('failure', 'Bundling failed, somehow ...');
        //   }
        // });
        break;
      case 'github':
        Promise.all([
          this.props.actions.fetchStoryBundle(this.props.activeStory.id, 'html'),
          this.props.actions.fetchStoryBundle(this.props.activeStory.id, 'json')
        ])
        .then((res) => {
          if (res[0].result && res[1].result)
            this.props.actions.exportToGist(res[0].result, res[1].result, this.props.activeStory.metadata.gistId);
        });
        // this.props.actions.setBundleHtmlStatus('processing', 'Asking the server to bundle a custom html file');
        // bundleProjectAsHtml(this.props.activeStory, (err, html) => {
        //   if (err === null) {
        //     this.props.actions.exportToGist(html, this.props.activeStory, this.props.activeStory.metadata.gistId);
        //     this.props.actions.setBundleHtmlStatus('success', 'Bundling is a success !');
        //   }
        //   else {
        //     this.props.actions.setBundleHtmlStatus('failure', 'Bundling failed, somehow ...');
        //   }
        // });
        break;
      case 'server':
        this.props.actions.exportStoryBundle(this.props.activeStory.id);
        break;
      default:
        break;
    }
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const serverAvailable = serverUrl !== undefined;
    const gistAvailable = githubTokenProviderUrl !== undefined && githubAPIClientId !== undefined;
    return (
      <TakeAwayDialogLayout
        {...this.props}
        serverAvailable={serverAvailable}
        serverUrl={serverUrl}
        gistAvailable={gistAvailable}
        updateActiveStoryFromServer={this.updateActiveStoryFromServer}
        updateActiveStoryFromGist={this.updateActiveStoryFromGist}
        takeAway={this.takeAway} />
    );
  }
}

export default TakeAwayDialogContainer;
