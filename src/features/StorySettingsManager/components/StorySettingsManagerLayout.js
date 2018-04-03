/**
 * This module exports a stateless component rendering the layout of the story settings manager interface
 * @module fonio/features/StorySettingsManager
 */
import React from 'react';
import PropTypes from 'prop-types';

import StoryPlayer, {templates} from 'quinoa-story-player';
import {Link} from 'react-router-dom';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import OptionSelect from '../../../components/OptionSelect/OptionSelect';
// import Toaster from '../../../components/Toaster/Toaster';
import CodeEditor from '../../../components/CodeEditor/CodeEditor';
import Footer from '../../../components/Footer/Footer';

import './StorySettingsManagerLayout.scss';

const StorySettingsManagerLayout = ({
  // xhrStatus,
  activeStory,
  activeStoryId,
  // citationStylesList = [],
  // citationLocalesList = [],
  // settingsVisible,

  actions: {
    setStoryCss,
    setStoryCssFromUser,
    setStorySettingOption,
    // setCitationStyle,
    // setCitationLocale,
    // setSettingsVisibility,
    // setStoryTemplate,
  },
  openSettings,
}, context) => {
  // namespacing the translation keys
  const translate = translateNameSpacer(context.t, 'Features.StorySettingsManager');

  // safely retrieving active settings data
  const visibleCss = (activeStory && activeStory.settings && activeStory.settings.cssFromUser) || '';
  const activeTemplate = (activeStory && activeStory.settings && activeStory.settings.template) || 'garlic';
  const activeTemplateData = templates.find(template => template.id === activeTemplate);
  // const activeCitationStyleId = activeStory && activeStory.settings && activeStory.settings.citationStyle && activeStory.settings.citationStyle.id;
  // const activeCitationLocaleId = activeStory && activeStory.settings && activeStory.settings.citationLocale && activeStory.settings.citationLocale.id;


  /**
   * Callbacks
   */
  // const onDisqusChange = val => {
  //   // val can be 'yes' or 'no'
  //   // todo: switch to a boolean ?
  //   setStorySettingOption(activeStoryId, 'allowDisqusComments', val);
  // };
  const onNotePositionChange = value => {
    setStorySettingOption(activeStoryId, 'notesPosition', value);
  };
  // const onTemplateChange = value => {
  //   setStoryTemplate(activeStoryId, value);
  // };
  // const onCitationStyleChange = value => {
  //   setCitationStyle(activeStoryId, value);
  // };
  // const onCitationLocaleChange = value => {
  //   setCitationLocale(activeStoryId, value);
  // };
  const onCssChange = css => {
    setStoryCssFromUser(activeStoryId, css);
    setStoryCss(activeStoryId, css);
  };

  return (
    <section className="fonio-StorySettingsManagerLayout">
      <aside className={'settings-pannel'}>
        <Link to="/">
          <button className="returnToLanding-btn" type="button">
            <span className="fonio-icon">
              <img src={require('../../../sharedAssets/logo-quinoa.png')} />
            </span>
            <b>Fonio </b>
            {translate('back-to-home')}
          </button>
        </Link>
        <div className="settings-pannel-body">
          {/*<section className="settings-section">
            <h2>{translate('template-title')}</h2>
            <OptionSelect
              title={translate('choose-a-template')}
              options={templates.map(template => ({
                value: template.id,
                label: template.name
              }))}
              onChange={onTemplateChange}
              activeOptionId={activeTemplate} />
          </section>*/}
          <section className="settings-section">
            <h2>{translate('options-title')}</h2>
            {/*
              // allow disqus comments
              activeTemplateData && activeTemplateData.acceptsOptions.indexOf('allowDisqusComments') > -1 &&
              <OptionSelect
                title={translate('allow-disqus-comments')}
                options={[
                  {
                    value: 'yes',
                    label: translate('yes')
                  },
                  {
                    value: 'no',
                    label: translate('no')
                  }
                ]}
                onChange={onDisqusChange}
                activeOptionId={activeStory.settings.options.allowDisqusComments || 'no'} />
            */}
            {
              // notes position
              activeTemplateData && activeTemplateData.acceptsOptions.indexOf('notesPosition') > -1 &&
              <OptionSelect
                title={translate('notes-position')}
                options={[
                  {
                    value: 'foot',
                    label: translate('footnote')
                  },
                  {
                    value: 'aside',
                    label: translate('sidenote')
                  }
                ]}
                onChange={onNotePositionChange}
                activeOptionId={(activeStory && activeStory.settings.options && activeStory.settings.options.notesPosition) || 'foot'} />
            }
          </section>
          {/*<section className="settings-section">
            <h2>{translate('citation-settings-title')}</h2>
            <OptionSelect
              title={translate('choose-a-citation-style')}
              options={citationStylesList.map(citationStyle => ({
                value: citationStyle.id,
                label: citationStyle.title
              }))}
              onChange={onCitationStyleChange}
              searchable
              activeOptionId={activeCitationStyleId || 'apa'} />
            <OptionSelect
              title={translate('choose-a-citation-locale')}
              options={citationLocalesList.map(citationLocale => ({
                value: citationLocale.id,
                label: citationLocale.names.join('-')
              }))}
              onChange={onCitationLocaleChange}
              searchable
              activeOptionId={activeCitationLocaleId || 'en-US'} />
            {xhrStatus &&
              <Toaster status={xhrStatus} log={translate('loading')} />
            }
          </section>*/}
          <section className="settings-section">
            <h2>{translate('customize-css-title')}</h2>
            <div className="css-customizer-container">
              <CodeEditor
                value={visibleCss}
                onChange={onCssChange} />
            </div>
          </section>
        </div>
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

      </aside>
      <section className="preview-container">
        <StoryPlayer story={activeStory} />
      </section>
    </section>
  );
};


/**
 * Context data used by the component
 */
StorySettingsManagerLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired,
};


export default StorySettingsManagerLayout;
