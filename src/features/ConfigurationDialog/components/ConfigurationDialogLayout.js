/**
 * This module exports a stateless component rendering the layout of the configuration dialog feature interface
 * @module fonio/features/ConfigurationDialog
 */
import React from 'react';
import PropTypes from 'prop-types';

import Textarea from 'react-textarea-autosize';

import HelpPin from '../../../components/HelpPin/HelpPin';
// import DropZone from '../../../components/DropZone/DropZone';
import AuthorsManager from '../../../components/AuthorsManager/AuthorsManager';
import Toaster from '../../../components/Toaster/Toaster';
import {translateNameSpacer} from '../../../helpers/translateUtils';

import './ConfigurationDialog.scss';

/**
 * Renders the configuration dialog layout
 * @param {object} props - the props to render
 * @param {object} props.storyCandidate - the data of the story to configure
 * @param {string} props.fetchUserFileStatus - the status of the file the user is trying to upload
 * @param {string} props.dataSourceTab - ui state for the source of data set by the user
 * @param {object} props.activeVisualizationTypes - models to display available visualization types
 * @param {object} props.activeVisualizationTypesModels - models to use for displaying visualization type related configurations
 * @param {object} props.actions - actions from the redux logic
 * @param {function} props.closeStoryCandidate - function to trigger for closing the story
 * @param {function} props.onFileDrop - callback function to be handled by container
 * @param {function} props.validateFileExtension - util to validate globally a file extension
 * @param {object} props.editedColor - current edited color (allows just once at a time)
 * @return {ReactElement} markup
 */
const ConfigurationDialogLayout = ({
  activeStoryId,
  storyCandidate,
  storyCandidatePassword,
  createStoryLog,
  createStoryLogStatus,
  // coverImageLoadingState,
  formErrors,
  showErrors,
  // router props
  history,
  actions: {
    setCandidateStoryMetadata,
    setCandidateStoryPassword,
    validateStoryCandidateSettings,
    submitStoryCandidateSettings,
    applyStoryCandidateConfiguration,
    // submitCoverImage,
    createStory
  },
  closeStoryCandidate,
}, context) => {
  // namespacing the translation keys with feature id
  const translate = translateNameSpacer(context.t, 'Features.ConfigurationDialog');
  /**
   * Callbacks
   */
  const onApplyChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    submitStoryCandidateSettings();
    if (activeStoryId) {
      if (formErrors.authors || formErrors.title)
        return;
      applyStoryCandidateConfiguration(storyCandidate);
    }
    else {
      if (formErrors.password || formErrors.authors || formErrors.title)
        return;
      createStory(storyCandidate, storyCandidatePassword)
      .then((res) => {
        if (res.result) {
          const {story} = res.result;
          applyStoryCandidateConfiguration(story);
          history.push({
            pathname: `/story/${story.id}/edit`
          });
        }
      });
    }
  };
  const onPasswordChange = (e) => {
    setCandidateStoryPassword(e.target.value);
    validateStoryCandidateSettings('password', e.target.value);
  };
  const setStoryTitle = (e) => {
    setCandidateStoryMetadata('title', e.target.value);
    validateStoryCandidateSettings('title', e.target.value);
  };
  const setStoryAuthors = authors => {
    setCandidateStoryMetadata('authors', authors);
    validateStoryCandidateSettings('authors', authors);
  };
  const setStoryDescription = (e) => setCandidateStoryMetadata('description', e.target.value);
  // const onCoverSubmit = (files) => submitCoverImage(files[0]);
  const preventSubmit = e => e.preventDefault();

  // todo this is temporary and should be replaced by a test
  const storyBegan = storyCandidate.content;

  return (
    <div className="fonio-ConfigurationDialogLayout">
      <h1 className="modal-header">
        {translate('story-configuration')}
      </h1>
      <section className="modal-content">
        <section className="modal-row">
          <h2>{translate('what-is-your-story-about')}
            <HelpPin>
              {translate('what-is-your-story-about-help')}
            </HelpPin>
          </h2>
          <form
            onSubmit={preventSubmit}
            className="modal-columns-container">
            <div className="modal-column">
              <div className="input-group">
                <label htmlFor="title">{translate('title-of-the-story')}*</label>
                <input
                  onChange={setStoryTitle}
                  type="text"
                  name="title"
                  placeholder={translate('title-of-the-story')}
                  value={storyCandidate.metadata.title || ''} />
                {showErrors &&
                  <Toaster status={formErrors.title && 'failure'} log={formErrors.title} />
                }
              </div>
              {!localStorage.getItem(storyCandidate.id) &&
                <div className="input-group">
                  <label htmlFor="password">password*</label>
                  <input
                    onChange={onPasswordChange}
                    type="password"
                    name="password"
                    placeholder="password"
                    value={storyCandidatePassword || ''} />
                  {showErrors &&
                    <Toaster status={formErrors.password && 'failure'} log={formErrors.password} />
                  }
                </div>
              }
              <div className="input-group">
                <label htmlFor="authors">{translate('authors-of-the-story')}*</label>
                <AuthorsManager
                  authors={storyCandidate.metadata.authors}
                  onChange={setStoryAuthors} />
                {showErrors &&
                  <Toaster status={formErrors.authors && 'failure'} log={formErrors.authors} />
                }
              </div>
              <div className="input-group" style={{flex: 1}}>
                <label htmlFor="description">{translate('description-of-the-story')}</label>
                <Textarea
                  onChange={setStoryDescription}
                  type="text"
                  name="description"
                  placeholder={translate('description-of-the-story')}
                  style={{flex: 1}}
                  value={storyCandidate.metadata.description || ''} />
              </div>
            </div>
            <Toaster status={createStoryLogStatus} log={createStoryLog} />
          </form>
        </section>
        {/*<section className="modal-row">
          <h2>{translate('story-cover')}
            <HelpPin>
              {translate('story-cover-help')}
            </HelpPin>
          </h2>
          <div className="modal-columns-container">
            <Toaster status={coverImageLoadingState} log="loading" />
            <div className="modal-column">
              <DropZone
                onDrop={onCoverSubmit}>
                <div>
                  <p>{translate('drop-a-cover-image-file')}</p>
                </div>
              </DropZone>
            </div>
            {
              storyCandidate.metadata.coverImage ?
                <div className="modal-column">
                  <img
                    src={storyCandidate.metadata.coverImage} />
                </div>
              : null
            }
          </div>
        </section>*/}
      </section>
      <section className="modal-footer">
        {
          storyCandidate
        ?
          <button
            onClick={onApplyChange}
            className="valid-btn">{storyBegan /* todo : change to test if story is began */ ? translate('apply-changes-and-continue-story-edition') : translate('start-to-edit-this-story')}
          </button>
        : ''
      }
        <button
          className="cancel-btn"
          onClick={closeStoryCandidate}>
          {translate('cancel')}
        </button>
      </section>
    </div>
  );
};


/**
 * Context data used by the component
 */
ConfigurationDialogLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default ConfigurationDialogLayout;
