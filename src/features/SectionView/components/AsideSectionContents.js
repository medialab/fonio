/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Column,
  Field,
  Control,
  Input,
  Dropdown,
  FlexContainer,
  Image,
  StretchedLayoutItem,
  StretchedLayoutContainer,
  Button
} from 'quinoa-design-library/components';
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

const AsideSectionContents = ( {
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
  searchString,
  sections,
  setEditorFocus,
  setMainColumnMode,
  setResourceOptionsVisible,
  setResourceSortValue,
  setResourceSearchStringDebounce,
  handleSectionIndexChange,
  setSectionLevel,
  storyId,
  userId,
  userLockedResourceId,
  visibleResources,
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );

  if ( asideTabCollapsed ) {
        return null;
      }
      switch ( asideTabMode ) {
        case 'library':
          const setOption = ( option, optionDomain ) => {
            if ( optionDomain === 'filter' ) {
              handleResourceFilterToggle( option );
            }
            else if ( optionDomain === 'sort' ) {
              setResourceSortValue( option );
            }
          };
          const handleResourceSearchChange = ( e ) => setResourceSearchStringDebounce( e.target.value );
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
                          value={ searchString }
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
                    setSectionIndex={ handleSectionIndexChange }
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

AsideSectionContents.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AsideSectionContents;
