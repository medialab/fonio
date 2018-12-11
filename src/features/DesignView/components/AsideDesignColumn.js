/**
 * This module provides a layout component for displaying design view aside column layout
 * @module fonio/features/DesignView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { templates } from 'quinoa-story-player';
import {
  Column,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Tab,
  TabLink,
  TabList,
  Tabs,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import AsideDesignContents from './AsideDesignContents';

/**
 * Imports Assets
 */
import resourceSchema from 'quinoa-schemas/resource';

/**
 * Shared variables
 */
const resourceTypes = Object.keys( resourceSchema.definitions ).filter( ( t ) => t !== 'glossary' );

const AsideDesignColumn = ( {
  designAsideTabCollapsed,
  designAsideTabMode,
  stylesMode = 'code',
  story = {},
  style = {},

  setDesignAsideTabCollapsed,
  setDesignAsideTabMode,

  onUpdateCss,
  onUpdateSettings,

  referenceTypesVisible,
  setReferenceTypesVisible,

  setCssHelpVisible,

}, { t } ) => {

  /**
   * Variables definition
   */
  const { settings = {} } = story;
  const { options = {} } = settings;
  const template = templates.find( ( thatTemplate ) => thatTemplate.id === story.settings.template );
  const templateOptions = template.acceptsOptions || [];

  /**
   * Computed variables
   */
  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.DesignView' );

  /**
   * Callbacks handlers
   */
  const handleOptionChange = ( key, value ) => {
    onUpdateSettings( {
      ...settings,
      options: {
        ...settings.options,
        [key]: value
      }
    } );
  };
  const handleSettingsChange = ( key, value ) =>
    onUpdateSettings( {
      ...settings,
      [key]: value
    } );
  const handleUpdateReferenceTypes = ( type ) => {
    const referenceTypes = options.referenceTypes || [];
    let newReferenceTypes;
    if ( !referenceTypes.includes( type ) ) {
      newReferenceTypes = [ ...referenceTypes, type ];
    }
    else {
      newReferenceTypes = referenceTypes.filter( ( thatType ) => thatType !== type );
    }
    handleOptionChange( 'referenceTypes', newReferenceTypes );
  };

  const handleSetAsideAsSettings = () => setDesignAsideTabMode( 'settings' );
  const handleSetAsideAsStyles = () => setDesignAsideTabMode( 'styles' );
  const handleToggleAsideCollapsed = () => setDesignAsideTabCollapsed( !designAsideTabCollapsed );

  return (
    <Column
      style={ style }
      className={ 'is-hidden-mobile aside-design-container' }
      isSize={ designAsideTabCollapsed ? 1 : '1/4' }
      isWrapper
    >
      <StretchedLayoutContainer
        isDirection={ 'vertical' }
        isAbsolute
        style={ { overflow: 'visible' } }
      >
        <StretchedLayoutItem>
          <Column>
            <Tabs
              isBoxed
              isFullWidth
              style={ { overflow: 'hidden' } }
            >
              <TabList>
                {
                  !designAsideTabCollapsed &&
                  <Tab
                    onClick={ handleSetAsideAsSettings }
                    isActive={ designAsideTabMode === 'settings' }
                  >
                    <TabLink>{translate( 'Settings' )}</TabLink>
                  </Tab>
                }
                {
                  !designAsideTabCollapsed &&
                  'collapse' &&
                  <Tab
                    onClick={ handleSetAsideAsStyles }
                    isActive={ designAsideTabMode === 'styles' }
                  >
                    <TabLink>
                      {translate( 'Styles' )}
                    </TabLink>
                  </Tab>
                }
                <Tab
                  className={ 'is-hidden-mobile' }
                  onClick={ handleToggleAsideCollapsed }
                  isActive={ designAsideTabCollapsed }
                >
                  <TabLink
                    style={ {
                          boxShadow: 'none',
                          transform: designAsideTabCollapsed ? 'rotate(180deg)' : undefined,
                          transition: 'all .5s ease'
                        } }
                    data-for={ 'tooltip' }
                    data-effect={ 'solid' }
                    data-place={ 'right' }
                    data-tip={ designAsideTabCollapsed ? translate( 'show settings pannels' ) : translate( 'hide settings pannels' ) }
                  >
                      ◀
                  </TabLink>
                </Tab>
              </TabList>
            </Tabs>
          </Column>
        </StretchedLayoutItem>
        <StretchedLayoutItem
          isFlex={ 1 }
          isFlowing
          style={ { overflow: 'visible' } }
        >
          <AsideDesignContents
            {
              ...{
                designAsideTabCollapsed,
                designAsideTabMode,
                handleOptionChange,
                handleSettingsChange,
                setReferenceTypesVisible,
                templateOptions,
                onUpdateCss,
                story,
                stylesMode,
                setCssHelpVisible,
                options,
                resourceTypes,
                handleUpdateReferenceTypes,
                referenceTypesVisible,
              }
            }
          />
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

AsideDesignColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideDesignColumn;
