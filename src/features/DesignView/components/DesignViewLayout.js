/* eslint react/no-danger : 0 */
import React from 'react';
import PropTypes from 'prop-types';

import {
  StretchedLayoutContainer,
  ModalCard,
  Content,
  Button,
} from 'quinoa-design-library/components';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import AsideDesignColumn from './AsideDesignColumn';
import MainDesignColumn from './MainDesignColumn';


const DesignViewLayout = ({
  designAsideTabMode,
  designAsideTabCollapsed,
  editedStory: story,
  referenceTypesVisible,
  cssHelpVisible,
  lang,
  actions: {
    setDesignAsideTabMode,
    setDesignAsideTabCollapsed,
    setReferenceTypesVisible,
    setCssHelpVisible,
  },
  onUpdateCss,
  onUpdateSettings,
}, {t}) => {
  const translate = translateNameSpacer(t, 'Features.DesignView');

  const cssHelpData = [
  {
    action: translate('Change the paragraphs font size'),
    code: `
p{
  font-size: 10px;
}`
  },
  {
    action: translate('Change the background color'),
    code: `
.body-wrapper,.body-wrapper .nav{
  background: white!important;
}`
  },
  {
    action: translate('Change the titles color'),
    code: `
h1,h2
{
  color: blue;
}`
  }
  ];

  return (
    <StretchedLayoutContainer isDirection="horizontal" isAbsolute>
      <AsideDesignColumn
        story={story}
        designAsideTabCollapsed={designAsideTabCollapsed}
        designAsideTabMode={designAsideTabMode}
        style={{minWidth: designAsideTabCollapsed ? undefined : '30%'}}
        className={`aside-edition-container ${designAsideTabCollapsed ? 'is-collapsed' : ''} is-hidden-mobile`}

        setCssHelpVisible={setCssHelpVisible}
        setDesignAsideTabMode={setDesignAsideTabMode}
        setDesignAsideTabCollapsed={setDesignAsideTabCollapsed}
        referenceTypesVisible={referenceTypesVisible}
        setReferenceTypesVisible={setReferenceTypesVisible}
        onUpdateCss={onUpdateCss}
        onUpdateSettings={onUpdateSettings} />

      <MainDesignColumn
        lang={lang}
        story={story} />
      <ModalCard
        isActive={cssHelpVisible}
        onClose={() => setCssHelpVisible(false)}
        headerContent={translate('CSS Styling - help')}
        style={{
          maxHeight: '80%'
        }}
        mainContent={
          <Content>
            <p>
              {translate('You can style your story output with custom css rules.')}
            </p>
            <p
              dangerouslySetInnerHTML={{
                __html: translate('To do so, you must be familiar with css syntax. To get started, we advise you to go to <a target="blank" href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS">this tutorial</a>')
              }} />
            <p>
              {translate('You might need to use the !important suffix for some rules as you want to override initial ones.')}
            </p>
            <p>
              {translate('Here are a few examples of things you could do:')}
            </p>
            <table>
              <tbody>
                {
                  cssHelpData.map((example, index) => {
                    const onAddCode = () => {
                      const css = story.settings.css || '';
                      const newCss = `${css.trim()}\n\n${example.code.trim()}`.trim();
                      onUpdateCss(newCss);
                    };
                    return (
                      <tr key={index}>
                        <th>{example.action}</th>
                        <th><pre><code>{example.code}</code></pre></th>
                        <th><Button onClick={onAddCode}>{translate('add')}</Button></th>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </Content>
        } />
    </StretchedLayoutContainer>);
};

DesignViewLayout.contextTypes = {
  t: PropTypes.func
};
export default DesignViewLayout;
