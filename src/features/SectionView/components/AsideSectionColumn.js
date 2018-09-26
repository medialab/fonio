/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import resourceSchema from 'quinoa-schemas/resource';
import {
  Button,
  Column,
  Control,
  Dropdown,
  FlexContainer,
  // DropZone,
  Field,
  Input,
  Image,
  Tab,
  TabLink,
  TabList,
  Tabs,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import ResourcesList from './ResourcesList';
import SortableMiniSectionsList from './SortableMiniSectionsList';

/**
 * Shared variables
 */
const resourceTypes = Object.keys( resourceSchema.definitions );

class AsideSectionColumn extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      searchString: ''
    };
    this.setResourceSearchString = debounce( this.setResourceSearchString, 500 );
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

      /*
       * resourceSearchString,
       * setResourceSearchString,
       */
      resourceFilterValues,
      setResourceFilterValues,
      resourceSortValue,
      setResourceSortValue,

      onResourceEditAttempt,

      onDeleteResource,
      onSetCoverImage,
      // submitMultiResources,

      onDeleteSection,
      onOpenSectionSettings,
      onCloseSectionSettings,
      onCloseActiveResource,
      onSortEnd,
      setSectionIndex,
      history,
    } = this.props;
    const { t } = this.context;
    const translate = translateNameSpacer( t, 'Features.SectionView' );
    const {
      id: storyId,
      metadata: {
        coverImage = {}
      }
    } = story;

    const coverImageId = coverImage.resourceId;

    const toggleResourceFilter = ( type ) => {
      setResourceFilterValues( {
        ...resourceFilterValues,
        [type]: resourceFilterValues[type] ? false : true
      } );
    };

    const renderAside = () => {
      if ( asideTabCollapsed ) {
        return null;
      }
      switch ( asideTabMode ) {
        case 'library':
          const setOption = ( option, optionDomain ) => {
            if ( optionDomain === 'filter' ) {
              toggleResourceFilter( option );
            }
            else if ( optionDomain === 'sort' ) {
              setResourceSortValue( option );
            }
          };
          const handleResourceSearchChange = ( e ) => this.setResourceSearchStringDebounce( e.target.value );
          const handleToggleResourcesOptionVisible = () => {
            setResourceOptionsVisible( !resourceOptionsVisible );
          };
          const handleClickAddItemsToLibrary = () => {
            if ( mainColumnMode === 'edition' ) {
              setEditorFocus( undefined );
            }

            setMainColumnMode( mainColumnMode === 'newresource' ? 'edition' : 'newresource' );
          };
          return (
            <StretchedLayoutContainer
              className={ 'aside-section-column' }
              isFluid
              isAbsolute
            >
              <StretchedLayoutItem>
                <Column style={ { paddingTop: 0, paddingBottom: 0 } }>
                  <Column style={ { paddingTop: 0, paddingBottom: 0 } }>
                    <Field hasAddons>
                      <Control style={ { flex: 1 } }>
                        <Input
                          value={ this.state.searchString }
                          onChange={ handleResourceSearchChange }
                          placeholder={ translate( 'find a resource' ) }
                        />
                        {/*<Input value={resourceSearchString} onChange={e => setResourceSearchString(e.target.value)} placeholder={translate('find a resource')} />*/}
                      </Control>
                      <Control>
                        <Dropdown
                          closeOnChange={ false }
                          menuAlign={ 'right' }
                          isColor={ Object.keys( resourceFilterValues ).filter( ( f ) => resourceFilterValues[f] ).length > 0 ? 'info' : '' }
                          onToggle={ handleToggleResourcesOptionVisible }
                          onChange={ setOption }
                          isActive={ resourceOptionsVisible }
                          value={ {
                          sort: {
                            value: resourceSortValue,
                          },
                          filter: {
                            value: Object.keys( resourceFilterValues ).filter( ( f ) => resourceFilterValues[f] ),
                          }
                        } }
                          options={ [
                          {
                            label: translate( 'Sort items by' ),
                            id: 'sort',
                            options: [
                              {
                                id: 'edited recently',
                                label: translate( 'edited recently' )
                              },
                              {
                                id: 'title',
                                label: translate( 'title' )
                              },
                            ]
                          },
                          {
                            label: translate( 'Show ...' ),
                            id: 'filter',
                            options: resourceTypes.map( ( type ) => ( {
                              id: type,
                              label: (
                                <FlexContainer
                                  flexFlow={ 'row' }
                                  alignItems={ 'center' }
                                >
                                  <Image
                                    style={ { display: 'inline-block', marginRight: '1em' } }
                                    isSize={ '16x16' }
                                    src={ icons[type].black.svg }
                                  />
                                  <span>
                                    {translate( type )}
                                  </span>
                                </FlexContainer>
                              )
                            } ) ),
                          }
                        ] }
                        >
                          {translate( 'Filters' )}
                        </Dropdown>
                      </Control>
                    </Field>
                  </Column>
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem
                isFlex={ 1 }
                isFlowing
              >
                <Column isWrapper>
                  <ResourcesList
                    resources={ visibleResources }
                    onDeleteResource={ onDeleteResource }
                    onSetCoverImage={ onSetCoverImage }
                    coverImageId={ coverImageId }
                    storyId={ storyId }
                    userId={ userId }
                    onCloseSettings={ onCloseActiveResource }
                    onResourceEditAttempt={ onResourceEditAttempt }
                    reverseResourcesLockMap={ reverseResourcesLockMap }
                    getResourceTitle={ getResourceTitle }
                    userLockedResourceId={ userLockedResourceId }
                  />
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem>
                <Column style={ { paddingTop: 0 } }>
                  <Column style={ { paddingTop: 0 } }>
                    <Button
                      isFullWidth
                      style={ { overflow: 'visible' } }
                      onClick={ handleClickAddItemsToLibrary }
                      isColor={ mainColumnMode === 'newresource' ? 'primary' : 'info' }
                      isDisabled={ userLockedResourceId !== undefined }
                    >
                      <span style={ { paddingRight: '1rem' } }>{translate( 'Add items to library' )}</span>
                    </Button>
                  </Column>
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          );
        case 'summary':
        default:
          const handleOpenSettings = ( thatSection ) => {
                      setEditorFocus( undefined );
                      if ( mainColumnMode === 'editmetadata' ) {
                       onCloseSectionSettings();
                      }
                      else {
                       onOpenSectionSettings( thatSection.id );
                      }
                    };
          const handleClickNewSection = () => {
                        if ( mainColumnMode === 'edition' ) {
                          setEditorFocus( undefined );
                        }
                        setMainColumnMode( mainColumnMode === 'newsection' ? 'edition' : 'newsection' );
                      };
          return (
            <StretchedLayoutContainer
              isFluid
              isAbsolute
            >
              <StretchedLayoutItem
                isFlex={ 1 }
                isFlowing
              >
                <Column isWrapper>
                  <SortableMiniSectionsList
                    storyId={ storyId }
                    items={ sections }
                    onSortEnd={ onSortEnd }
                    history={ history }
                    setSectionIndex={ setSectionIndex }
                    maxSectionIndex={ sections.length - 1 }
                    onOpenSettings={ handleOpenSettings }
                    onDeleteSection={ onDeleteSection }
                    setSectionLevel={ setSectionLevel }
                    useDragHandle
                  />
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem >
                <Column style={ { paddingTop: 0 } }>
                  <Column style={ { paddingTop: 0 } }>
                    <Button
                      style={ { overflow: 'visible' } }
                      isDisabled={ userLockedResourceId !== undefined && mainColumnMode === 'edition' }
                      onClick={ handleClickNewSection }
                      isColor={ 'primary' }
                      isFullWidth
                    >
                      <span style={ { paddingRight: '1rem' } }>{translate( 'New section' )}</span>
                    </Button>
                  </Column>
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          );
      }
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
                        {/*asideTabCollapsed ? '▶' : '◀'*/}
                      </TabLink>
                    </Tab>
                  </TabList>
                </Column>
              </Tabs>
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={ 1 }>
            <Column>
              {renderAside()}
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
