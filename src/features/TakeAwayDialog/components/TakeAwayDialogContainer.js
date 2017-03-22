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
  closeTakeAwayModal,
  selector as fonioSelector
} from '../../Editor/duck';

import {
  selector as storiesSelector,
  updateStory
} from '../../StoriesManager/duck';

import downloadFile from '../../../helpers/fileDownloader';
import {
  bundleProjectAsHtml,
  // bundleProjectAsJSON,
  cleanPresentationForExport
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
    ...fonioSelector(state.fonioEditor),
    ...storiesSelector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      closeTakeAwayModal,
      updateStory
    }, dispatch)
  })
)
class TakeAwayDialogContainer extends Component {

  constructor(props) {
    super(props);
    this.takeAway = debounce(this.takeAway.bind(this), 300);
    this.updateActivePresentationFromServer = this.updateActivePresentationFromServer.bind(this);
    this.updateActivePresentationFromGist = this.updateActivePresentationFromGist.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  updateActivePresentationFromServer() {
    // todo : rewrite that as an action
    this.props.actions.setExportToServerStatus('processing', 'updating from the distant server');
    const url = this.props.activePresentation.metadata.serverJSONUrl;
    get(url)
      .end((err, res) => {
        if (err) {
          return this.props.actions.setExportToServerStatus('failure', 'connection with distant server has failed');
        }
        try {
          const project = JSON.parse(res.text);
          this.props.actions.updateStory(project.id, project);
          this.props.actions.setExportToServerStatus('success', 'your story is now synchronized with the forccast server');
        }
 catch (e) {
          this.props.actions.setExportToServerStatus('failure', 'The distant version is badly formatted');
        }
      });
  }
  updateActivePresentationFromGist() {
    // todo : rewrite that as an action
    const gistId = this.props.activePresentation.metadata.gistId;
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

  takeAway(takeAwayType) {
    const JSONbundle = cleanPresentationForExport(this.props.activePresentation); // bundleProjectAsJSON(this.props.activePresentation);
    const title = this.props.activePresentation.metadata.title;
    switch (takeAwayType.id) {
      case 'project':
        downloadFile(JSON.stringify(JSONbundle, null, 2), 'json', title);
        break;
      case 'html':
        this.props.actions.setTakeAwayType('html');
        this.props.actions.setBundleHtmlStatus('processing', 'Asking the server to bundle a custom html file');
        bundleProjectAsHtml(this.props.activePresentation, (err, html) => {
          this.props.actions.setTakeAwayType(undefined);
          if (err === null) {
            downloadFile(html, 'html', title);
            this.props.actions.setBundleHtmlStatus('success', 'Bundling is a success !');
          }
          else {
            this.props.actions.setBundleHtmlStatus('failure', 'Bundling failed, somehow ...');
          }
        });

        break;
      case 'github':
        this.props.actions.setBundleHtmlStatus('processing', 'Asking the server to bundle a custom html file');
        bundleProjectAsHtml(this.props.activePresentation, (err, html) => {
          if (err === null) {
            this.props.actions.exportToGist(html, JSONbundle, this.props.activePresentation.metadata.gistId);
            this.props.actions.setBundleHtmlStatus('success', 'Bundling is a success !');
          }
          else {
            this.props.actions.setBundleHtmlStatus('failure', 'Bundling failed, somehow ...');
          }
        });
        break;
      case 'server':
        this.props.actions.exportToServer(JSONbundle);
        break;
      default:
        break;
    }
  }

  render() {
    const serverAvailable = serverUrl !== undefined;
    const gistAvailable = githubTokenProviderUrl !== undefined && githubAPIClientId !== undefined;
    return (
      <TakeAwayDialogLayout
        {...this.props}
        serverAvailable={serverAvailable}
        serverUrl={serverUrl}
        gistAvailable={gistAvailable}
        updateActivePresentationFromServer={this.updateActivePresentationFromServer}
        updateActivePresentationFromGist={this.updateActivePresentationFromGist}
        takeAway={this.takeAway} />
    );
  }
}

export default TakeAwayDialogContainer;
