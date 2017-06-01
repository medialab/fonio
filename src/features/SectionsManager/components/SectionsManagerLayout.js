/**
 * This module exports a stateless component rendering the layout of the sections manager feature interface
 * @module fonio/features/SectionsManager
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import SectionCard from '../../../components/SectionCard/SectionCard';

import SectionConfigurationDialog from './SectionConfigurationDialog';
import './SectionsManager.scss';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

/**
 * Renders the sections manager layout
 * @param {object} props - the props to render
 * @return {ReactElement} markup
 */
const SectionsManagerLayout = ({
  activeStoryId,
  sectionCandidate,
  sectionCandidateId,
  sectionPromptedToDelete,
  sections,
  sectionsModalState = 'closed',
  sectionsSearchQuery,
  createSection,
  createSubSection,
  updateSection,
  updateSectionsOrder,

  activeSectionId,

  actions: {
    setActiveSectionId,
    // createSection
    deleteSection,
    setSectionCandidateMetadataValue,
    setSectionsModalState,
    setSectionsSearchQuery,
    startExistingSectionConfiguration,
    requestDeletePrompt,
    abortDeletePrompt,
  },
  style,
}, context) => {
    const translate = translateNameSpacer(context.t, 'Features.SectionsManager');
    const onModalClose = () => setSectionsModalState('closed');
    const onSearchInputChange = (e) => setSectionsSearchQuery(e.target.value);
    return (
      <div
        className={'fonio-sections-manager-layout'}
        style={style}>
        <ul className="body">
          {
            sections.map((section, index) => {
              const onDelete = () => deleteSection(activeStoryId, section.id);
              const onEdit = () => startExistingSectionConfiguration(section.id, section);
              const onSelect = () => setActiveSectionId(section.id);
              const onUpdateMetadata = (metadata) => {
                updateSection(
                  section.id,
                  {
                    ...section,
                    metadata
                  }
                );
              };
              const onMove = (from, to) => {
                const order = sections.map(thatSection => thatSection.id);
                const sectionId = sections[from].id;
                order.splice(from, 1);
                order.splice(to, 0, sectionId);
                updateSectionsOrder(order);
              };
              const onCreateSubSection = () => {
                createSubSection(section, index);
              };
              const onRequestDeletePrompt = () => {
                requestDeletePrompt(section.id);
              };
              const onAbortDeletePrompt = () => {
                abortDeletePrompt();
              };
              return (
                <SectionCard
                  key={index}
                  onDelete={onDelete}
                  onConfigure={onEdit}
                  onSelect={onSelect}

                  onRequestDeletePrompt={onRequestDeletePrompt}
                  onAbortDeletePrompt={onAbortDeletePrompt}
                  promptedToDelete={sectionPromptedToDelete === section.id}

                  createSubSection={onCreateSubSection}

                  sectionKey={section.id}
                  sectionIndex={index}
                  onMove={onMove}

                  active={section.id === activeSectionId}
                  style={{cursor: 'move'}}
                  onUpdateMetadata={onUpdateMetadata}
                  {...section} />
              );
            })
          }
          <li id="new-section" onClick={createSection}>
            + {translate('new-section')}
          </li>
        </ul>
        <div className="footer">
          <input
            className="search-query"
            type="text"
            placeholder={translate('search-in-sections')}
            value={sectionsSearchQuery || ''}
            onChange={onSearchInputChange} />
        </div>

        <Modal
          isOpen={sectionsModalState !== 'closed'}
          contentLabel={translate('edit-section')}
          onRequestClose={onModalClose}>
          <SectionConfigurationDialog
            sectionCandidate={sectionCandidate}
            sectionCandidateId={sectionCandidateId}
            onClose={onModalClose}
            setSectionCandidateMetadataValue={setSectionCandidateMetadataValue}
            createSection={createSection}
            updateSection={updateSection} />
        </Modal>
      </div>
    );
};
SectionsManagerLayout.contextTypes = {
  t: PropTypes.func.isRequired
};
// export default SectionsManagerLayout;
export default DragDropContext(HTML5Backend)(SectionsManagerLayout);
