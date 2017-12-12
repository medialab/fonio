/**
 * This module exports a stateless component rendering the layout of the stories manager interface
 * @module fonio/features/StoriesManager
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {v4 as uuid} from 'uuid';

import './StoriesManagerLayout.scss';

import DropZone from '../../../components/DropZone/DropZone';
import StoryCard from '../../../components/StoryCard/StoryCard';
import LangToggler from '../../../components/LangToggler/LangToggler';
import Toaster from '../../../components/Toaster/Toaster';

import {translateNameSpacer} from '../../../helpers/translateUtils';


/**
 * Renders the layout component of the feature
 * @param {object} props - the props to render
 * @param {string} props.lang - the active language
 * @param {array} props.presentaiontsList - the list of locally stored stories
 * @param {object} props.importCandidate - cached story waiting to be imported or not
 * @param {string} props.importStatus
 * @param {string} props.importError
 * @param {string} props.promptedToDeleteId
 * @param {number} props.maxNumberOfLocalStories
 * @param {string} props.importFromUrlCandidate
 * @param {function} props.onDropInput
 * @param {function} props.overrideImportWithCandidate
 * @param {function} props.importFromDistantJSON
 * @param {function} props.actions - actions passed by redux logic
 * @return {ReactElement} markup
 */
const StoriesManagerLayout = ({
  lang,
  // content-related
  storiesList = [],
  importCandidate,
  // ui-related
  importStatus,
  importError,
  promptedToDeleteId,
  maxNumberOfLocalStories,
  importFromUrlCandidate,
  history,
  // actions
  onDropInput,
  overrideImportWithCandidate,
  importFromDistantJSON,
  actions: {
    promptDeleteStory,
    unpromptDeleteStory,
    deleteStory,
    copyStory,
    startStoryCandidateConfiguration,
    setUiMode,
    openPasswordModal,
    importReset,
    setImportFromUrlCandidate,
    setLanguage
  }
}, context) => {
  // namespacing the translation keys with feature id
  const translate = translateNameSpacer(context.t, 'Features.StoriesManager');
  // check if max number of stories is reached
  const allowNewStories = storiesList.length < maxNumberOfLocalStories;
  /**
   * Callbacks
   */
  const onCreateStory = () => {
    startStoryCandidateConfiguration();
  };
  const onImportFromUrlChange = (e) => setImportFromUrlCandidate(e.target.value);
  return (
    <section className="fonio-StoriesManagerLayout">
      <section className="landing-group">
        <div className="brand-cartel">
          <img src={require('../assets/logo-quinoa.png')} />
          <div className="title">
            <h1><span>Fonio</span></h1>
            <h2 className="app-baseline">{translate('fonio-baseline')}</h2>
          </div>
        </div>
        <div className="row-section">
          <p className="important-explanation">
            {translate('description-$1-goal')}
          </p>
          <p className="important-explanation">
            {translate('description-$2-flow')}
          </p>
          <p className="important-explanation">
            <LangToggler lang={lang} onChange={setLanguage} />
          </p>
        </div>
        {/*<div className="row-section">
          <iframe
            width="100%"
            height="300"
            src="https://www.youtube.com/embed/y_15ar6ZyQ4"
            frameBorder="0"
            allowFullScreen />
        </div>*/}
        <div className="row-section about">
          <p>
            {translate('about-forccast')}
          </p>
          <p>
            {translate('about-medialab')}
          </p>
          <p>
            <a className="medialab" target="blank" href="http://www.medialab.sciences-po.fr/">
              <img src={require('../assets/logo-medialab.png')} />
            </a>
          </p>
        </div>
      </section>

      <section className="landing-group">

        {allowNewStories ?
          <div className="row-section">
            <button className="new-story" onClick={onCreateStory}>
              {translate('start-a-new-story')}
            </button>
          </div> :
          <p>
            {translate('maximum-stories-reached')}
          </p>
          }

        <div className="row-section stories-group">
          {storiesList.length > 0 ?
            <h4>
              {translate('or-continue-locally-stored-story')}
            </h4>
            : null}
          <ul className="local-stories-list">
            {storiesList.map((story, index) => {
            const onClickPrompt = () => {
              if (sessionStorage.getItem(story.id)) {
                promptDeleteStory(story.id);
              }
              else {
                openPasswordModal();
                history.push({
                  pathname: '/login',
                  state: {
                    storyId: story.id,
                    to: '/'
                  }
                });
              }
            };
            const onClickUnprompt = () => unpromptDeleteStory(story.id);
            const onClickDelete = () => deleteStory(story.id);
            const onClickCopy = () => {
              const original = story;
              const newId = uuid();
              const newStory = {
                // todo: better way to do that ?
                ...JSON.parse(JSON.stringify(original)),
                id: newId,
                metadata: {
                  ...original.metadata,
                  title: original.metadata.title + ' - copy'
                }
              };
              copyStory(newStory);
            };
            const setToActive = () => {
              if (sessionStorage.getItem(story.id)) {
                setUiMode();
                history.push({
                  pathname: `/${story.id}/edit`
                });
              }
              else {
                openPasswordModal();
                history.push({
                  pathname: '/login',
                  state: {
                    storyId: story.id,
                    to: `/${story.id}/edit`
                  }
                });
              }
            };
            const configure = () => {
              if (sessionStorage.getItem(story.id)) {
                startStoryCandidateConfiguration(story);
              }
              else {
                openPasswordModal();
                history.push({
                  pathname: '/login',
                  state: {
                    storyId: story.id,
                    to: '/'
                  }
                });
              }
            };
            const promptedToDelete = promptedToDeleteId === story.id;
            return (
              <StoryCard
                key={index}
                story={story}
                promptedToDelete={promptedToDelete}
                setToActive={setToActive}
                configure={configure}
                onClickDelete={onClickDelete}
                onClickPrompt={onClickPrompt}
                onClickUnprompt={onClickUnprompt}
                onClickCopy={onClickCopy} />
            );
          })
          }
          </ul>
        </div>
        {allowNewStories ?
          <div className="row-section">
            <h3>
              {translate('import-project-from-computer')}

            </h3>
            <DropZone
              accept="application/json"
              onDrop={onDropInput}>
              {translate('drop-a-json-file-here')}
            </DropZone>
          </div>
        : null}
        {allowNewStories ?
          <div className="row-section import-from-url">
            <h3>
              {translate('fetch-an-existant-project-from-distant-server')}
            </h3>
            <form onSubmit={importFromDistantJSON}>
              <input
                value={importFromUrlCandidate || ''}
                onChange={onImportFromUrlChange} type="text"
                placeholder={translate('copy-paste-url-of-the-project')} />
              <input
                type="submit"
                value={translate('import')} />
            </form>
          </div> : null}
        <div className="import-status-display">
          <Toaster
            status={importStatus} log={
              <span className="import-error-display">
                {
              importError === 'badJSON' ?
              translate('your-file-is-badly-formatted')
              : ''
            }
                {importError === 'invalidProject' ?
              translate('your-file-is-not-a-valid-story')
              : ''}
                {importError === 'invalidUrl' ?
              translate('the-url-did-not-point-to-a-valid-story')
              : ''}
                {importError === 'invalidGist' ?
              translate('the-gist-is-not-properly-formatted')
              : ''}
                {importError === 'fetchError' ?
              translate('the-fetching-process-failed')
              : ''}
              </span>
          } />
        </div>
      </section>

      <Modal
        onRequestClose={importReset}
        contentLabel="Override the existing story"
        isOpen={importCandidate !== undefined}>
        <h1 className="modal-header">
          {translate('story-already-exists')}
        </h1>
        <div className="modal-content">
          <div className="modal-row">
            {translate('you-seem-to-have-already-this-story')}
            <br /><br />
            {translate('do-you-wish-to-override-story')}
          </div>
        </div>
        <div className="modal-footer override-modal-footer">
          <button onClick={overrideImportWithCandidate}>
            {translate('override-existing-version-of-story')}
          </button>
          <button onClick={importReset}>
            {translate('cancel')}
          </button>
        </div>
      </Modal>
    </section>
  );
};


/**
 * Context data used by the component
 */
StoriesManagerLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default StoriesManagerLayout;
