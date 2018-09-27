/**
 * This module provides a layout component for displaying the design view
 * @module fonio/features/DesignView
 */
/* eslint react/no-danger : 0 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  StretchedLayoutContainer,
  ModalCard,
  Content,
  Button,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import buildCssHelp from '../utils/buildCssHelp';

/**
 * Imports Components
 */
import AsideDesignColumn from './AsideDesignColumn';
import MainDesignColumn from './MainDesignColumn';

const DesignViewLayout = ( {
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
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.DesignView' );

  /**
   * Computed variables
   */
  const cssHelpData = buildCssHelp( translate );

  /**
   * Callbacks handlers
   */
  const handleHideCssHelp = () => setCssHelpVisible( false );

  return (
    <StretchedLayoutContainer
      isDirection={ 'horizontal' }
      isAbsolute
    >
      <AsideDesignColumn
        story={ story }
        designAsideTabCollapsed={ designAsideTabCollapsed }
        designAsideTabMode={ designAsideTabMode }
        style={ { minWidth: designAsideTabCollapsed ? undefined : '30%' } }
        className={ `aside-edition-container ${designAsideTabCollapsed ? 'is-collapsed' : ''} is-hidden-mobile` }

        setCssHelpVisible={ setCssHelpVisible }
        setDesignAsideTabMode={ setDesignAsideTabMode }
        setDesignAsideTabCollapsed={ setDesignAsideTabCollapsed }
        referenceTypesVisible={ referenceTypesVisible }
        setReferenceTypesVisible={ setReferenceTypesVisible }
        onUpdateCss={ onUpdateCss }
        onUpdateSettings={ onUpdateSettings }
      />

      <MainDesignColumn
        lang={ lang }
        story={ story }
      />
      <ModalCard
        isActive={ cssHelpVisible }
        onClose={ handleHideCssHelp }
        headerContent={ translate( 'CSS Styling - help' ) }
        style={ {
          maxHeight: '80%'
        } }
        mainContent={
          <Content>
            <p>
              {translate( 'You can style your story output with custom css rules.' )}
            </p>
            <p
              dangerouslySetInnerHTML={ {
                  __html: translate( 'To do so, you must be familiar with css syntax. To get started, we advise you to go to <a target="blank" href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS">this tutorial</a>' )
                } }
            />
            <p>
              {translate( 'Here are a few examples of things you could do:' )}
            </p>
            <table>
              <tbody>
                {
                    cssHelpData.map( ( example, index ) => {
                      const handleAddCode = () => {
                        const css = story.settings.css || '';
                        const newCss = `${css.trim()}\n\n${example.code.trim()}`.trim();
                        onUpdateCss( newCss );
                      };
                      return (
                        <tr key={ index }>
                          <th>{example.action}</th>
                          <th style={ { maxWidth: '20rem' } }><pre><code>{example.code}</code></pre></th>
                          <th><Button onClick={ handleAddCode }>{translate( 'add' )}</Button></th>
                        </tr>
                      );
                    } )
                  }
              </tbody>
            </table>
          </Content>
        }
      />
    </StretchedLayoutContainer> );
};

DesignViewLayout.contextTypes = {
  t: PropTypes.func
};
export default DesignViewLayout;
