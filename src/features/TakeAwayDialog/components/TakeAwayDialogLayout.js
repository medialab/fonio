/**
 * This module exports a stateless component rendering the layout of the takeway dialog feature interface
 * @module fonio/features/TakeAwayDialog
 */
import React from 'react';
import PropTypes from 'prop-types';

import './TakeAwayDialog.scss';

import BigSelect from '../../../components/BigSelect/BigSelect';
import Toaster from '../../../components/Toaster/Toaster';
import HelpPin from '../../../components/HelpPin/HelpPin';
import {translateNameSpacer} from '../../../helpers/translateUtils';
/**
 * Renders the options for takeaway mode choice
 * @param {object} props - the props to render
 * @param {function} takeAway - callback
 * @param {function} setTakeAwayType - callback
 * @param {string} takeAwayType - the active takeawayType
 * @param {boolean} serverAvailable - whether app is implemented with a distant server connection
 * @param {boolean} gistAvailable - whether app is implemented with a gistAvailable connection
 * @return {ReactElement} markup
 */
export const ChooseTakeAwayStep = ({
  takeAway,
  setTakeAwayType,
  takeAwayType,
  serverAvailable,
  gistAvailable,
  serverHtmlUrl,
  gistId
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.TakeAway');
  const optionSelect = (option) => {
    switch (option.id) {
      case 'server':
        if (!serverHtmlUrl) {
          takeAway(option);
        }
        return setTakeAwayType(option.id);

      case 'github':
        if (!gistId) {
          takeAway(option);
        }
        return setTakeAwayType(option.id);
      default:
        return takeAway(option);
    }
  };
 // todo : put this data in a model file ? to decide
  const options = [{
          id: 'project',
          icon: require('../assets/project.svg'),
          label: <span>
            {translate('project-file')}
            <HelpPin>
              {translate('project-file-help')}
            </HelpPin></span>,
          possible: true
        },
        {
          id: 'markdown',
          icon: require('../assets/html.svg'),
          label: <span>
            {translate('markdown-file')}
            <HelpPin>
              {translate('markdown-file-help')}
            </HelpPin></span>,
          possible: true
        },
        {
          id: 'html',
          icon: require('../assets/html.svg'),
          label: <span>
            {translate('html-file')}
            <HelpPin>
              {translate('html-file-help')}
            </HelpPin>
          </span>,
          possible: serverAvailable === true
        },
        {
          id: 'github',
          icon: require('../assets/github.svg'),
          label: <span>
            {translate('gist-powered-website')}
            <HelpPin>
              {translate('gist-powered-website-help')}
            </HelpPin></span>,
          possible: serverAvailable === true && gistAvailable === true
        },
        {
          id: 'server',
          icon: require('../assets/server.svg'),
          label: <span>
            {translate('forccast-website')}
            <HelpPin position="left">
              {translate('forccast-website-help')}
            </HelpPin>
          </span>,
          possible: serverAvailable === true
        }
        ]
        .filter(option => option.possible === true);
  return (
    <BigSelect
      options={options}
      activeOptionId={takeAwayType}
      onOptionSelect={optionSelect} />
  );
};

ChooseTakeAwayStep.contextTypes = {
  t: PropTypes.func.isRequired
};

/**
 * Renders the layout of the take away dialog
 * @param {object} props - the props to render
 * @param {object} props.activePresentation - the presentation to take away
 * @param {string} props.takeAwayType - the active takeaway type
 * @param {string} props.takeAwayGistLog
 * @param {string} props.takeAwayGistLogStatus
 * @param {string} props.takeAwayServerLog
 * @param {string} props.takeAwayServerLogStatus
 * @param {string} props.bundleToHtmlLog
 * @param {string} props.bundleToHtmlLogStatus
 * @param {boolean} props.serverAvailable - whether app is connected to a distant server
 * @param {string} props.serverUrl - the url base of the distant server
 * @param {boolean} props.gistAvailable - whether app is connected to gist
 * @param {function} props.takeAway - main callback function for container
 * @param {function} props.updateActivePresentationFromGist -
 * @param {function} props.updateActivePresentationFromServer -
 * @param {object} props.actions - actions passed by redux logic
 * @return {ReactElement} markup
 */
const TakeAwayDialogLayout = ({
  activePresentation,
  takeAwayType,
  takeAwayGistLog,
  takeAwayGistLogStatus,
  takeAwayServerLog,
  takeAwayServerLogStatus,
  bundleToHtmlLog,
  bundleToHtmlLogStatus,
  serverAvailable,
  serverUrl,
  gistAvailable,
  // actions
  takeAway,
  updateActivePresentationFromGist,
  updateActivePresentationFromServer,
  actions: {
    closeTakeAwayModal,
    setTakeAwayType
  },
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.TakeAway');
  const updateActivePresentationToServer = () => takeAway({id: 'server'});
  const updateActivePresentationToGist = () => takeAway({id: 'github'});
  return (
    <div className="fonio-take-away-dialog-layout">
      <h1 className="modal-header">
        {translate('take-away-your-story')}
      </h1>
      <section className="modal-content">
        <section className="modal-row">
          <ChooseTakeAwayStep
            takeAway={takeAway}
            setTakeAwayType={setTakeAwayType}
            serverAvailable={serverAvailable}
            takeAwayType={takeAwayType}
            gistAvailable={gistAvailable}
            serverHtmlUrl={activePresentation && activePresentation.metadata && activePresentation.metadata.serverHTMLUrl}
            gistId={activePresentation && activePresentation.metadata && activePresentation.metadata.gistId} />
        </section>
        <section className={'modal-row ' + (bundleToHtmlLogStatus || takeAwayGistLogStatus || takeAwayServerLogStatus ? '' : 'empty')}>
          <Toaster status={bundleToHtmlLogStatus} log={bundleToHtmlLog} />
          <Toaster status={takeAwayGistLogStatus} log={takeAwayGistLog} />
          <Toaster status={takeAwayServerLogStatus} log={takeAwayServerLog} />
        </section>
        <section className="modal-row">
          {
          takeAwayType === 'github' &&
          activePresentation && activePresentation.metadata && activePresentation.metadata.gistId ?
            <div className="sync-section-container">
              <h2><img src={require('../assets/github.svg')} />{translate('your-story-is-online-on-gist')}</h2>
              <div className="sync-section">
                <div className="column">
                  <p>
                    <a target="blank" href={activePresentation.metadata.gistUrl}>
                      → {translate('go-to-the-gist-source-code-of-your-presentation')}
                    </a>
                    <a target="blank" href={serverUrl + '/gist-presentation/' + activePresentation.metadata.gistId}>
                      → {translate('go-to-the-gist-based-webpage-of-your-presentation')}
                    </a>
                  </p>
                  <p>{translate('embed-inside-an-html-webpage')}</p>
                  <pre>
                    <code>
                      {`<iframe allowfullscreen src="${serverUrl + '/gist-presentation/' + activePresentation.metadata.gistId}" width="1000" height="500" frameborder=0></iframe>`}
                    </code>
                  </pre>
                </div>
                <div className="column">
                  <div className="operations">
                    <button className="update-to" onClick={updateActivePresentationToGist}>
                      ↑ {translate('update-local-version-to-the-repository')}
                      <HelpPin position="left">
                        {translate('the-online-version-will-be-overriden-with-your-current-version')}
                      </HelpPin>
                    </button>
                    <button className="update-from" onClick={updateActivePresentationFromGist}>
                      ↓ {translate('update-local-version-from-the-repository')}
                      <HelpPin position="left">
                        {translate('your-current-version-will-be-overriden-with-the-distant-version')}
                      </HelpPin>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            : null
        }
          {
          takeAwayType === 'server' &&
          activePresentation && activePresentation.metadata && activePresentation.metadata.serverHTMLUrl ?
            <div className="sync-section-container">
              <h2><img src={require('../assets/server.svg')} />Your presentation is online on the forccast server</h2>
              <div className="sync-section">
                <div className="column">
                  <p>
                    <a target="blank" href={activePresentation.metadata.serverHTMLUrl}>
                    → {translate('go-to-the-online-webpage')}
                    </a>
                  </p>
                  <p>{translate('embed-inside-an-html-webpage')}</p>
                  <pre>
                    <code>
                      {`<iframe allowfullscreen src="${activePresentation.metadata.serverHTMLUrl}" width="1000" height="500" frameborder=0></iframe>`}
                    </code>
                  </pre>
                </div>
                <div className="column">
                  <div className="operations">
                    <button className="update-to" onClick={updateActivePresentationToServer}>
                      ↑ {translate('update-local-version-to-the-repository')}
                      <HelpPin position="left">
                        {translate('the-online-version-will-be-overriden-with-your-current-version')}
                      </HelpPin>
                    </button>
                    <button className="update-from" onClick={updateActivePresentationFromServer}>
                      ↓ {translate('update-local-version-from-the-repository')}
                      <HelpPin position="left">
                        {translate('your-current-version-will-be-overriden-with-the-distant-version')}
                      </HelpPin>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            : ''
        }
        </section>
      </section>
      <section className="modal-footer">
        <button
          onClick={closeTakeAwayModal}>
          {translate('close')}
        </button>
      </section>
    </div>);
};

TakeAwayDialogLayout.contextTypes = {
  t: PropTypes.func.isRequired
};

export default TakeAwayDialogLayout;
