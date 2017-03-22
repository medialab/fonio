/**
 * This module provides a reusable story card component
 * @module fonio/components/PresentationCard
 */
import React, {PropTypes} from 'react';

import {translateNameSpacer} from '../../helpers/translateUtils';

import './StoryCard.scss';

const PresentationCard = ({
  story,
  promptedToDelete,
  // actions
  setToActive,
  configure,
  onClickDelete,
  onClickPrompt,
  onClickUnprompt,
  onClickCopy
}, context) => {

  const translate = translateNameSpacer(context.t, 'Components.PresentationCard');
  return (
    <li className="fonio-story-card">
      <div className="card-body">
        <div className="info-column">
          <h5 onClick={setToActive}>
            <span className="title">{story.metadata && story.metadata.title && story.metadata.title.length ? story.metadata.title : translate('untitled_story')}</span>
          </h5>
          <p className="description">
            {story.metadata && story.metadata.description && story.metadata.description.length ? story.metadata.description : translate('no_description')}
          </p>
        </div>
        <div className="buttons-column">
          <button className="edit-btn" onClick={setToActive}>
            <img src={require('./assets/edit.svg')} className="fonio-icon-image" />
            {translate('edit')}
          </button>
          <button className="settings-btn" onClick={configure}>
            <img src={require('./assets/settings.svg')} className="fonio-icon-image" />
            {translate('settings')}
          </button>
          <button className={'delete-btn ' + (promptedToDelete ? 'inactive' : '')} onClick={onClickPrompt}>
            <img src={require('./assets/close.svg')} className="fonio-icon-image" />
            {translate('delete')}
          </button>
        </div>
      </div>
      <div className="card-footer">
        {promptedToDelete ?
          <div className="delete-prompt-container">
            {promptedToDelete ? <p>{translate('sure_delete')}</p> : null}
            <div className="button-row">
              <button className="delete-btn" onClick={onClickDelete}>
                {translate('delete_confirm')}
              </button>
              <button onClick={onClickUnprompt}>{translate('cancel')}</button>
            </div>
          </div> : <button onClick={onClickCopy}>⎘ {translate('duplicate')}</button> }
      </div>
    </li>
  );
};

PresentationCard.contextTypes = {
  t: PropTypes.func.isRequired
};

export default PresentationCard;
