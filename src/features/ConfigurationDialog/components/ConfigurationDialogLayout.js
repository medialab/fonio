/**
 * This module exports a stateless component rendering the layout of the configuration dialog feature interface
 * @module fonio/features/ConfigurationDialog
 */
import React from 'react';
import PropTypes from 'prop-types';

import Textarea from 'react-textarea-autosize';

import HelpPin from '../../../components/HelpPin/HelpPin';
import DropZone from '../../../components/DropZone/DropZone';
// import Toaster from '../../../components/Toaster/Toaster';
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
  storyCandidate,
  fetchUserFileStatus,
  dataSourceTab,
  // todo : delete the following variable and do everything with visualizationTypesModels
  activeVisualizationTypes = [],
  visualizationTypesModels,
  actions: {
    fetchExampleFile,
    fetchUserFile,
    setCandidateStoryMetadata,
    setCandidateStoryDatasetMetadata,
    unsetStoryCandidateDataset,
    setStoryCandidateVisualizationType,
    setStoryCandidateDatamapItem,
    toggleCandidateColorEdition,
    setStoryCandidateColor,
    applyStoryCandidateConfiguration,
    setStoryCandidateViewOption,
    setDataSourceTab,
    submitCoverImage
  },
  closeStoryCandidate,
  onFileDrop,
  validateFileExtension,
  editedColor
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.ConfigurationDialog');
  const onApplyChange = () => applyStoryCandidateConfiguration(storyCandidate);
  const setStoryTitle = (e) => setCandidateStoryMetadata('title', e.target.value);
  const setStoryAuthors = (e) => setCandidateStoryMetadata('authors', e.target.value);
  const setStoryDescription = (e) => setCandidateStoryMetadata('description', e.target.value);
  const onCoverSubmit = (files) => submitCoverImage(files[0]);
  // todo this is temporary and should be replaced by a test
  const storyBegan = storyCandidate.content;
  return (
    <div className="fonio-configuration-dialog-layout">
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
          <form className="modal-columns-container">
            <div className="modal-column">
              <div className="input-group">
                <label htmlFor="title">{translate('title-of-the-story')}</label>
                <input
                  onChange={setStoryTitle}
                  type="text"
                  name="title"
                  placeholder={translate('title-of-the-story')}
                  value={storyCandidate.metadata.title || ''} />
              </div>

              <div className="input-group">
                <label htmlFor="authors">{translate('authors-of-the-story')}</label>
                <input
                  onChange={setStoryAuthors}
                  type="text"
                  name="authors"
                  placeholder={translate('authors-of-the-story')}
                  value={storyCandidate.metadata.authors || ''} />
              </div>
            </div>

            <div className="modal-column">
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
          </form>
        </section>
        <section className="modal-row">
          <h2>{translate('story-cover')}
            <HelpPin>
              {translate('story-cover-help')}
            </HelpPin>
          </h2>
          <div className="modal-columns-container">
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
        </section>
      </section>
      <section className="modal-footer">
        {
          storyCandidate
        ?
          <button
            className="valid-btn"
            onClick={onApplyChange}>{storyBegan /* todo : change to test if story is began */ ? translate('apply-changes-and-continue-story-edition') : translate('start-to-edit-this-story')}</button>
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

ConfigurationDialogLayout.contextTypes = {
  t: PropTypes.func.isRequired
};
export default ConfigurationDialogLayout;
