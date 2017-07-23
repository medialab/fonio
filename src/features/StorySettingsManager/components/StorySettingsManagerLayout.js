/**
 * This module exports a stateless component rendering the layout of the story settings manager interface
 * @module fonio/features/StorySettingsManager
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextArea from 'react-textarea-autosize';
import StoryPlayer, {templates} from 'quinoa-story-player';


import './StorySettingsManagerLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import OptionSelect from '../../../components/OptionSelect/OptionSelect';
import Toaster from '../../../components/Toaster/Toaster';

const StorySettingsManagerLayout = ({
  xhrStatus,
  activeStory,
  activeStoryId,
  citationStylesList = [],
  citationLocalesList = [],
  settingsVisible,

  actions: {
    setStoryCss,
    setStorySettingOption,
    setCitationStyle,
    setCitationLocale,
    setSettingsVisibility,
    setStoryTemplate,
  }
}, context) => {
  // namespacing the translation keys
  const translate = translateNameSpacer(context.t, 'Features.StorySettingsManager');
  const activeCss = (activeStory && activeStory.settings && activeStory.settings.css) || '';

  const activeTemplate = (activeStory && activeStory.settings && activeStory.settings.template) || 'garlic';
  const activeTemplateData = templates.find(template => template.id === activeTemplate);
  const activeCitationStyleId = activeStory && activeStory.settings && activeStory.settings.citationStyle && activeStory.settings.citationStyle.id;
  const activeCitationLocaleId = activeStory && activeStory.settings && activeStory.settings.citationLocale && activeStory.settings.citationLocale.id;

  const onDisqusChange = val => {
    const value = val === 'yes' ? true : false;
    setStorySettingOption(activeStoryId, 'allowDisqusComments', value);
  };
  const onNotePositionChange = value => {
    setStorySettingOption(activeStoryId, 'notesPosition', value);
  };
  const onTemplateChange = value => {
    setStoryTemplate(activeStoryId, value);
  };
  const onCitationStyleChange = value => {
    setCitationStyle(activeStoryId, value);
  };
  const onCitationLocaleChange = value => {
    setCitationLocale(activeStoryId, value);
  };
  const onCssChange = e => {
    const css = e.target.value;
    setStoryCss(activeStoryId, css);
  };

  const toggleSettingsVisibility = () => {
    if (settingsVisible) {
      setSettingsVisibility(false);
    }
 else setSettingsVisibility(true);
  };

  return (
    <section className="fonio-StorySettingsManagerLayout">
      <aside className={'settings-pannel ' + (settingsVisible ? 'visible' : 'hidden')}>
        <div
          className="settings-pannel-header"
          onClick={toggleSettingsVisibility}>
          <h1>
            <span>{translate('story-settings-title')}</span>
            {settingsVisible && <img className="fonio-icon-image" src={require('../../../sharedAssets/close-black.svg')} />}
          </h1>
        </div>
        <div className="settings-pannel-body">
          <section className="settings-section">
            <h2>{translate('template-title')}</h2>
            <OptionSelect
              title={translate('choose-a-template')}
              options={templates.map(template => ({
                value: template.id,
                label: template.name
              }))}
              onChange={onTemplateChange}
              activeOptionId={activeTemplate} />
          </section>
          <section className="settings-section">
            <h2>{translate('options-title')}</h2>
            {
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
                activeOptionId={activeStory && activeStory.settings.options && activeStory.settings.options.allowDisqusComments === false ? 'no' : 'no'} />
            }
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
          <section className="settings-section">
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
              <Toaster status="processing" log={translate('loading')} />
            }
          </section>
          <section className="settings-section">
            <h2>{translate('customize-css-title')}</h2>
            <div className="css-customizer-container">
              <TextArea
                minRows={10}
                maxRows={12}
                defaultValue="Write custom css code here"
                value={activeCss}
                onChange={onCssChange} />
              {!activeCss.length &&
              <pre className="css-example">

                <code>
                  {`Example:
.quinoa-story-player{
  color: red;
}`}
                </code>
              </pre>
            }
            </div>
          </section>
        </div>
      </aside>
      <section className="preview-container">
        <StoryPlayer story={activeStory} />
      </section>
    </section>
  );
};

StorySettingsManagerLayout.contextTypes = {
  t: PropTypes.func.isRequired,
};


export default StorySettingsManagerLayout;
