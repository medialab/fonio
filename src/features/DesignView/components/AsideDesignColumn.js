/**
 * This module provides a layout component for displaying design view aside column layout
 * @module fonio/features/DesignView
 */
/**
 * Imports Libraries
 */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
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
import { findTempateByVersion, getStyles } from 'quinoa-schemas';

/**
 * Imports Components
 */
import AsideDesignContents from './AsideDesignContents';

/**
 * Imports Assets
 */
import resourceSchema from 'quinoa-schemas/resource';
import { templates } from 'quinoa-story-player';

/**
 * Shared variables
 */
const resourceTypes = Object.keys( resourceSchema.definitions ).filter( ( t ) => t !== 'glossary' );

const AsideDesignColumn = ( {
  designAsideTabCollapsed,
  designAsideTabMode,
  story = {},
  style = {},
  coverImageChoiceVisible,

  setDesignAsideTabCollapsed,
  setDesignAsideTabMode,
  setCoverImageChoiceVisible,

  onUpdateTemplatesVariables,

  referenceTypesVisible,
  setReferenceTypesVisible,
  onSetCoverImage,

  setCssHelpVisible,

  onTemplateChange,

  templateChoiceVisible,
  notesPositionChoiceVisible,
  referenceStatusChoiceVisible,
  setTemplateChoiceVisible,
  setNotesPositionChoiceVisible,
  setReferenceStatusChoiceVisible,

}, { t } ) => {

  /**
   * Variables definition
   */
  const { options } = getStyles( story );

  const template = findTempateByVersion( story, templates );

  /**
   * Computed variables
   */
  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.DesignView' );
  const handleSetAsideAsSettings = () => setDesignAsideTabMode( 'settings' );
  const handleSetAsideAsStyles = () => setDesignAsideTabMode( 'styles' );
  const handleToggleAsideCollapsed = () => setDesignAsideTabCollapsed( !designAsideTabCollapsed );
  const containerRef = useRef( null );
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
        isOver
        isOverflowVisible
        style={ {
            paddingLeft: designAsideTabCollapsed ? undefined : '1rem'
          } }
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
                  style={ { flex: 0 } }
                >
                  <TabLink
                    style={ {
                          boxShadow: 'none',
                          transform: designAsideTabCollapsed ? 'rotate(180deg)' : undefined,
                          transition: 'all .5s ease',
                          paddingRight: designAsideTabCollapsed ? undefined : 0,
                          display: designAsideTabCollapsed ? 'inline-block' : 'flex',
                          justifyContent: designAsideTabCollapsed ? undefined : 'flex-end',
                          textAlign: 'left'
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
          isOverflowVisible
          ref={ containerRef }
        >
          <AsideDesignContents
            {
              ...{
                getTooltipContainer: () => containerRef.current,
                designAsideTabCollapsed,
                designAsideTabMode,
                onUpdateTemplatesVariables,
                setReferenceTypesVisible,
                coverImageChoiceVisible,
                setCoverImageChoiceVisible,
                templateChoiceVisible,
                notesPositionChoiceVisible,
                referenceStatusChoiceVisible,
                setTemplateChoiceVisible,
                setNotesPositionChoiceVisible,
                setReferenceStatusChoiceVisible,
                onSetCoverImage,
                template,
                story,
                setCssHelpVisible,
                options,
                resourceTypes,
                referenceTypesVisible,
                onTemplateChange,
                templates
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
