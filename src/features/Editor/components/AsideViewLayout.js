/**
 * This module exports a stateless component rendering the aside contents of the editor feature interface
 * @module fonio/features/Editor
 */
import React from 'react';
import PropTypes from 'prop-types';

import './AsideViewLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import ResourcesManager from '../../ResourcesManager/components/ResourcesManagerContainer.js';

/**
 * Renders the aside view of the editor
 * @return {ReactElement} markup
 */
const AsideViewLayout = ({
  activeStory,
  returnToLanding,
  openSettings,
  activeStoryId
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  return (<aside className="fonio-aside-view">
    <div className="aside-header">
      <button className="returnToLanding-btn" onClick={returnToLanding} type="button"><span className="fonio-icon">☰</span> {translate('back-to-home')}</button>
      <button
        className="settings-btn"
        onClick={openSettings}
        type="button">
        <img
          className="fonio-icon-image"
          src={require('../assets/settings.svg')} />
        {activeStory && activeStory.metadata &&
            activeStory.metadata.title &&
            activeStory.metadata.title.length ?
              activeStory.metadata.title
              : translate('untitled-story')} - <i>
                {translate('settings')}</i>
      </button>
    </div>
    <ResourcesManager activeStory={activeStory} activeStoryId={activeStoryId} />
  </aside>);
};

AsideViewLayout.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AsideViewLayout;
