import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import HelpPin from '../../../components/HelpPin/HelpPin';
import AuthorsManager from '../../../components/AuthorsManager/AuthorsManager';

import './SectionConfigurationDialog.scss';

const SectionConfigurationDialog = ({
  sectionCandidate,
  sectionCandidateId,
  setSectionCandidateMetadataValue,
  onClose,
  createSection,
  updateSection
}, context) => {

  const translate = translateNameSpacer(context.t, 'Features.Editor');

  const onApplyChange = () => {
    if (sectionCandidateId) {
      updateSection(sectionCandidateId, sectionCandidate);
    }
    else {
      createSection(sectionCandidate);
    }
  };
  const setSectionTitle = (e) => setSectionCandidateMetadataValue('title', e.target.value);
  const setSectionAuthors = authors => setSectionCandidateMetadataValue('authors', authors);
  return (
    <div className="fonio-section-configuration-dialog">
      <h1 className="modal-header">
        {sectionCandidateId ? translate('edit-section') : translate('create-section')}
      </h1>
      <section className="modal-content">
        <section className="modal-row">
          <h2>{translate('section-metadata')}
            <HelpPin>
              {translate('section-metadata-help')}
            </HelpPin>
          </h2>
          <div className="input-group">
            <label htmlFor="title">{translate('title-of-the-section')}</label>
            <input
              onChange={setSectionTitle}
              type="text"
              name="title"
              placeholder={translate('title-of-the-section')}
              value={sectionCandidate.metadata.title} />
          </div>
          <div className="input-group">
            <label htmlFor="authors">{translate('authors-of-the-section')}</label>
            <AuthorsManager
              onChange={setSectionAuthors}
              authors={sectionCandidate.metadata.authors} />
          </div>
        </section>

      </section>
      <section className="modal-footer">
        {
          sectionCandidate
          ?
            <button
              className="valid-btn"
              onClick={onApplyChange}>{sectionCandidateId ? translate('update-section') : translate('create-section')}</button>
          : ''
        }
        <button
          onClick={onClose}>
          {translate('close')}
        </button>
      </section>
    </div>
  );
};

SectionConfigurationDialog.contextTypes = {
  t: PropTypes.func.isRequired
};

export default SectionConfigurationDialog;
