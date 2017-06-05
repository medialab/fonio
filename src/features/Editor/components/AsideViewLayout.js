/**
 * This module exports a stateless component rendering the aside contents of the editor feature interface
 * @module fonio/features/Editor
 */
import React from 'react';
import PropTypes from 'prop-types';


import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';


import './AsideViewLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import ResourcesManager from '../../ResourcesManager/components/ResourcesManagerContainer.js';
import SectionsManager from '../../SectionsManager/components/SectionsManagerContainer.js';
import AsideToggler from '../../../components/AsideToggler/AsideToggler.js';

/**
 * Renders the aside view of the editor
 * @return {ReactElement} markup
 */
const AsideViewLayout = ({
  activeStory,
  returnToLanding,
  openSettings,
  activeStoryId,
  asideUiMode,
  setAsideUiMode,
  hideNav,
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  const asideOptions = [
    {
      id: 'resources',
      name: translate('resources-header')
    },
    {
      id: 'sections',
      name: translate('sections-header')
    }
  ];
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
      <AsideToggler
        options={asideOptions}
        activeOption={asideUiMode}
        setOption={setAsideUiMode}
        hideNav={hideNav}
      />
    </div>
    <section className="aside-option-container">
      <ResourcesManager
        activeStory={activeStory}
        activeStoryId={activeStoryId}
        style={{
          left: asideUiMode === 'resources' ? '0' : '-100%'
        }} />
      <SectionsManager
        activeStory={activeStory}
        activeStoryId={activeStoryId}
        style={{
          left: asideUiMode === 'resources' ? '100%' : '0'
        }} />
    </section>
  </aside>);
};

AsideViewLayout.contextTypes = {
  t: PropTypes.func.isRequired
};

export default DragDropContext(HTML5Backend)(AsideViewLayout);
