/**
 * This module provides the layout for the aside column of the editor
 * @module fonio/features/SectionView
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import resourceSchema from 'quinoa-schemas/resource';
import {
  Column,
  Tab,
  TabLink,
  TabList,
  Tabs,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import AsideSectionContents from './AsideSectionContents';

/**
 * Shared variables
 */
const resourceTypes = Object.keys( resourceSchema.definitions );
const MEDIUM_TIMEOUT = 500;

class AsideSectionColumn extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      searchString: ''
    };
    this.setResourceSearchString = debounce( this.setResourceSearchString, MEDIUM_TIMEOUT );
  }

  componentDidMount = () => {
    const { resourceSearchString } = this.props;
    this.setState( {
      searchString: resourceSearchString
    } );
  }

  shouldComponentUpdate = ( nextProps, nextState ) => {
    const changingProps = [
      'asideTabCollapsed',
      'asideTabMode',
      'resourceOptionsVisible',
      'mainColumnMode',
      'activeUsers',
      'lockingMap',
      'userLockedResourceId',
      // 'sections',

      'resourceSearchString',
      'resourceFilterValues',
      'resourceSortValue',
    ];
    const {
      story: {
        metadata: {
          coverImage: prevCoverImage
        },
        resources: prevResources,
        sectionsOrder: prevSectionsOrder
      }
    } = this.props;
    const {
      story: {
        metadata: {
          coverImage: nextCoverImage
        },
        resources: nextResources,
        sectionsOrder: nextSectionsOrder
      }
    } = nextProps;
    const prevSectionsLocks = this.props.sections.map( ( s ) => s.lockStatus ).join( '-' );
    const nextSectionsLocks = nextProps.sections.map( ( s ) => s.lockStatus ).join( '-' );
    const prevSectionsLevels = this.props.sections.map( ( s ) => s.metadata.level ).join( '-' );
    const nextSectionsLevels = nextProps.sections.map( ( s ) => s.metadata.level ).join( '-' );
    const prevSectionsTitles = this.props.sections.map( ( s ) => s.metadata.title ).join( '-' );
    const nextSectionsTitles = nextProps.sections.map( ( s ) => s.metadata.title ).join( '-' );
    return (
      changingProps.find( ( propName ) => this.props[propName] !== nextProps[propName] ) !== undefined
      || prevResources !== nextResources
      || prevSectionsOrder !== nextSectionsOrder
      || prevSectionsLocks !== nextSectionsLocks
      || prevSectionsLevels !== nextSectionsLevels
      || prevSectionsTitles !== nextSectionsTitles
      || prevCoverImage !== nextCoverImage
      || this.state.searchString !== nextState.searchString
    );
  }

  setResourceSearchString = ( value ) => this.props.setResourceSearchString( value )

  setResourceSearchStringDebounce = ( value ) => {
    // const {setResourceSearchString} = this.props;
    this.setState( {
      searchString: value
    } );
    this.setResourceSearchString( value );
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      asideTabCollapsed,
      asideTabMode,
      resourceOptionsVisible,
      mainColumnMode,
      story,

      getResourceTitle,
      sections,

      userId,

      reverseResourcesLockMap,
      userLockedResourceId,

      setAsideTabCollapsed,
      setAsideTabMode,
      setResourceOptionsVisible,
      setMainColumnMode,
      setSectionLevel,
      setEditorFocus,

      visibleResources,
      resourceFilterValues,
      setResourceFilterValues,
      resourceSortValue,
      setResourceSortValue,

      onResourceEditAttempt,

      onDeleteResource,
      onSetCoverImage,

      onDeleteSection,
      onOpenSectionSettings,
      onCloseSectionSettings,
      onCloseActiveResource,
      onSortEnd,
      handleSectionIndexChange,
      history,
    } = this.props;
    const { t } = this.context;
    const {
      id: storyId,
      metadata: {
        coverImage = {}
      }
    } = story;

    /**
     * Computed variables
     */
    const coverImageId = coverImage.resourceId;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.SectionView' );

    /**
     * Callbacks handlers
     */
    const handleResourceFilterToggle = ( type ) => {
      setResourceFilterValues( {
        ...resourceFilterValues,
        [type]: resourceFilterValues[type] ? false : true
      } );
    };
    const handleSetAsideTabSummary = () => setAsideTabMode( 'summary' );
    const handleSetAsideTabLibrary = () => setAsideTabMode( 'library' );
    const handleToggleAsideTabCollapsed = () => setAsideTabCollapsed( !asideTabCollapsed );

    return (
      <Column isSize={ asideTabCollapsed ? 1 : '1/4' }>
        <StretchedLayoutContainer
          isFluid
          isAbsolute
        >
          <StretchedLayoutItem>
            <Column style={ { paddingRight: 0 } }>
              <Tabs
                isBoxed
                isFullWidth
                style={ { overflow: 'hidden' } }
              >
                <Column style={ { paddingRight: 0 } }>
                  <TabList>
                    {
                    !asideTabCollapsed &&
                    'collapse' &&
                    <Tab
                      onClick={ handleSetAsideTabSummary }
                      isActive={ asideTabMode === 'summary' }
                    >
                      <TabLink>
                        {translate( 'Summary' )}
                      </TabLink>
                    </Tab>
                    }
                    {
                    !asideTabCollapsed &&
                    <Tab
                      onClick={ handleSetAsideTabLibrary }
                      isActive={ asideTabMode === 'library' }
                    >
                      <TabLink>{translate( 'Library' )}</TabLink>
                    </Tab>
                    }
                    <Tab
                      onClick={ handleToggleAsideTabCollapsed }
                      isActive={ asideTabCollapsed }
                    >
                      <TabLink
                        style={ {
                          boxShadow: 'none',
                          transform: asideTabCollapsed ? 'rotate(180deg)' : undefined,
                          transition: 'all .5s ease'
                        } }
                        data-for={ 'tooltip' }
                        data-effect={ 'solid' }
                        data-place={ 'right' }
                        data-tip={ asideTabCollapsed ? translate( 'show summary and library pannels' ) : translate( 'hide summary and library pannels' ) }
                      >
                        ◀
                      </TabLink>
                    </Tab>
                  </TabList>
                </Column>
              </Tabs>
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={ 1 }>
            <Column>
              <AsideSectionContents
                {
                  ...{
                    asideTabCollapsed,
                    asideTabMode,
                    coverImageId,
                    getResourceTitle,
                    handleResourceFilterToggle,
                    history,
                    mainColumnMode,
                    onCloseActiveResource,
                    onCloseSectionSettings,
                    onDeleteResource,
                    onDeleteSection,
                    onOpenSectionSettings,
                    onResourceEditAttempt,
                    onSetCoverImage,
                    onSortEnd,
                    resourceFilterValues,
                    resourceOptionsVisible,
                    resourceSortValue,
                    resourceTypes,
                    reverseResourcesLockMap,
                    sections,
                    setEditorFocus,
                    setMainColumnMode,
                    setResourceOptionsVisible,
                    setResourceSortValue,
                    handleSectionIndexChange,
                    setSectionLevel,
                    storyId,
                    userId,
                    userLockedResourceId,
                    visibleResources,
                  }
                }
                setResourceSearchStringDebounce={ this.setResourceSearchStringDebounce }
                searchString={ this.state.searchString }
              />
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Column>
    );
  }
}

AsideSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideSectionColumn;
