/* eslint react/prefer-stateless-function : 0 */
/**
 * This module exports a stateless component rendering the aside contents of the editor feature interface
 * @module fonio/features/Editor
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';


import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';


import './AsideViewLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import ResourcesManager from '../../ResourcesManager/components/ResourcesManagerContainer.js';
import SectionsManager from '../../SectionsManager/components/SectionsManagerContainer.js';
import AsideToggler from '../../../components/AsideToggler/AsideToggler.js';
import Footer from '../../../components/Footer/Footer';


class AsideViewLayout extends Component {

  shouldComponentUpdate = () => true;

  render() {
    const {
      props: {
        activeStory,
        openSettings,
        activeStoryId,
        asideUiMode,
        setAsideUiMode,
        hideNav,
      },
      context
    } = this;

    // namespacing the translation keys with feature id
    const translate = translateNameSpacer(context.t, 'Features.Editor');
    // todo: should we put this elsewhere ?
    const asideOptions = [
      {
        id: 'sections',
        name: translate('sections-header')
      },
      {
        id: 'resources',
        name: translate('resources-header')
      }
    ];
    return (<aside className="fonio-AsideViewLayout">
      <div className="aside-header">
        <Link to="/">
          <button className="returnToLanding-btn" type="button">
            <span className="fonio-icon">
              <img src={require('../../../sharedAssets/logo-quinoa.png')} />
            </span>
            <b>Fonio </b>
            {translate('back-to-home')}
          </button>
        </Link>
        <AsideToggler
          options={asideOptions}
          activeOption={asideUiMode}
          setOption={setAsideUiMode}
          hideNav={hideNav} />
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
      <button
        className="global-settings-btn"
        onClick={openSettings}
        type="button">
        <img
          className="fonio-icon-image"
          src={require('../../../sharedAssets/settings.svg')} />
        {activeStory && activeStory.metadata &&
            activeStory.metadata.title &&
            activeStory.metadata.title.length ?
              activeStory.metadata.title
              : translate('untitled-story')} - <i>
                {translate('settings')}</i>
      </button>
      <Footer />
    </aside>);
  }
}


/**
 * Context data used by the component
 */
AsideViewLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default DragDropContext(HTML5Backend)(AsideViewLayout);
