/**
 * This module provides a connected component for displaying the section view
 * @module fonio/features/LibraryView
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { v4 as genId } from 'uuid';
import { isEmpty, debounce, uniq } from 'lodash';
import {
  Button,
  Column,
  Container,
  Content,
  DropZone,
  HelpPin,
  Level,
  ModalCard,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { getResourceTitle, searchResources } from '../../../helpers/resourcesUtils';
import { createBibData } from '../../../helpers/resourcesUtils';
import {
  removeContextualizationReferenceFromRawContents
} from '../../../helpers/assetsUtils';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  getReverseResourcesLockMap,
  getReverseSectionsLockMap,
  getCitedSections,
  getUserResourceLockId,
} from '../../../helpers/lockUtils';
import {
  base64ToBytesLength
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import PaginatedList from '../../../components/PaginatedList';
import ConfirmBatchDeleteModal from './ConfirmBatchDeleteModal';
import LibraryFiltersBar from './LibraryFiltersBar';
import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import ResourceForm from '../../../components/ResourceForm';
import ResourceCard from './ResourceCard';

/**
 * Imports Assets
 */
import resourceSchema from 'quinoa-schemas/resource';
import config from '../../../config';

/**
 * Shared variables
 */
const { maxBatchNumber, maxResourceSize } = config;
const realMaxFileSize = base64ToBytesLength( maxResourceSize );
const resourceTypes = Object.keys( resourceSchema.definitions );

class LibraryViewLayout extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      searchString: ''
    };
    this.setResourceSearchString = debounce( this.setResourceSearchString, 500 );
  }

  componentDidMount = () => {
    const { searchString } = this.props;
    this.setState( {
      searchString
    } );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.lockingMap !== nextProps.lockingMap ) {
        ReactTooltip.hide();
    }
  }

  setResourceSearchString = ( value ) => this.props.actions.setSearchString( value )

  setResourceSearchStringDebounce = ( value ) => {
    this.setState( {
      searchString: value
    } );
    this.setResourceSearchString( value );
  }

  renderMainColumn = () => {

    /**
     * Variables definition
     */
    const {
      editedStory: story = {},
      userId,
      lockingMap = {},
      activeUsers,

      mainColumnMode,
      optionsVisible,
      filterValues,
      sortValue,
      statusFilterValue,
      searchString,
      promptedToDeleteResourceId,
      selectedResourcesIds,
      resourcesPromptedToDelete,
      actions: {
        setOptionsVisible,
        setMainColumnMode,
        // setSearchString,
        setFilterValues,
        setSortValue,
        setStatusFilterValue,
        setPromptedToDeleteResourceId,

        enterBlock,
        leaveBlock,

        setUploadStatus,

        createResource,
        updateResource,
        deleteResource,
        uploadResource,
        deleteUploadedResource,
        updateSection,
        setSelectedResourcesIds,
        setResourcesPromptedToDelete,
        setIsBatchDeleting,
        setResourceDeleteStep,
        setCoverImage,
      },
    } = this.props;
    const { t } = this.context;

    const {
      resources = {},
      contextualizations = {},
      id: storyId,
      metadata: {
        coverImage = {}
      }
    } = story;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.LibraryView' );

    /**
     * Computed variables
     */
    const coverImageId = coverImage.resourceId;

    const userLockedResourceId = getUserResourceLockId( lockingMap, userId, storyId );
    const reverseResourcesLockMap = getReverseResourcesLockMap( lockingMap, activeUsers, storyId );
    const reverseSectionLockMap = getReverseSectionsLockMap( lockingMap, activeUsers, storyId );

    const activeFilters = Object.keys( filterValues ).filter( ( key ) => filterValues[key] );
    const statusFilterValues = [
      {
        id: 'all',
        label: translate( 'all items' )
      },
      {
        id: 'unlocked',
        label: translate( 'only editable items (not used by another author)' )
      },
      {
        id: 'unused',
        label: translate( 'only unused items (not mentionned anywhere in the story)' )
      }
    ];

     const reverseResourcesSectionsMap =
      Object.keys( contextualizations )
      .reduce( ( result, contextId ) => {
        const context = contextualizations[contextId];
        const activeCitedSections =
          getCitedSections( contextualizations, context.resourceId )
            .filter( ( id ) => {
              return ( reverseSectionLockMap[id] && reverseSectionLockMap[id].userId !== userId );
            } );
        if ( activeCitedSections.length > 0 ) {
          return {
            ...result,
            [context.resourceId]: { name: `other ${activeCitedSections.length} sections` }
          };
        }
        return result;
      }, {} );

    const resourcesLockMap = isEmpty( reverseResourcesLockMap ) ? reverseResourcesSectionsMap : reverseResourcesLockMap;

    const actualResourcesPromptedToDelete = resourcesPromptedToDelete.filter( ( resourceId ) => resourcesLockMap[resourceId] === undefined );

    const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] );

    let visibleResources = searchString.length === 0 ? resourcesList : searchResources( resourcesList, searchString );

    visibleResources = visibleResources
      .filter( ( resource ) => {
        if ( activeFilters.length ) {
          return activeFilters.indexOf( resource.metadata.type ) > -1;
        }
        return true;
      } )
      .filter( ( resource ) => {
        switch ( statusFilterValue ) {
          case 'unlocked':
            return !resourcesLockMap[resource.id];
          case 'unused':
            const citedResources = Object.keys( story.contextualizations )
              .map( ( contextualizationId ) => story.contextualizations[contextualizationId].resourceId );
            return citedResources.indexOf( resource.id ) === -1;
          case 'all':
          default:
            return true;
        }
      } )
      .sort( ( a, b ) => {
          switch ( sortValue ) {
            case 'edited recently':
              if ( a.lastUpdateAt > b.lastUpdateAt ) {
                return -1;
              }
              return 1;
            case 'title':
            default:
              const aTitle = getResourceTitle( a );
              const bTitle = getResourceTitle( b );
              if ( ( aTitle && bTitle ) && aTitle.toLowerCase().trim() > bTitle.toLowerCase().trim() ) {
                return 1;
              }
              return -1;
          }
        } );
    let endangeredContextualizationsLength = 0;
    if ( actualResourcesPromptedToDelete.length ) {
      endangeredContextualizationsLength = actualResourcesPromptedToDelete.reduce( ( sum, resourceId ) => {
        return sum + Object.keys( story.contextualizations )
                .filter( ( contextualizationId ) => story.contextualizations[contextualizationId].resourceId === resourceId )
                .length;
      }, 0 );
    }

    /**
     * Callbacks handlers
     */
    const handleFilterToggle = ( type ) => {
      setFilterValues( {
        ...filterValues,
        [type]: filterValues[type] ? false : true
      } );
    };

    const handleDeleteResourceConfirm = ( thatResourceId ) => {
      const realResourceId = typeof thatResourceId === 'string' ? thatResourceId : promptedToDeleteResourceId;
      const resource = resources[realResourceId];
      if ( !resource || resourcesLockMap[resource.id] ) {
        return;
      }
      const payload = {
        storyId,
        userId,
        resourceId: resource.id
      };
      // deleting entities in content states
      const relatedContextualizations = Object.keys( story.contextualizations ).map( ( c ) => story.contextualizations[c] )
        .filter( ( contextualization ) => contextualization.resourceId === realResourceId );

      const relatedContextualizationsIds = relatedContextualizations.map( ( c ) => c.id );
      const relatedContextualizationsSectionIds = uniq( relatedContextualizations.map( ( c ) => c.sectionId ) );

      if ( relatedContextualizationsIds.length ) {
        const changedSections = relatedContextualizationsSectionIds.reduce( ( tempSections, sectionId ) => {
          const section = tempSections[sectionId] || story.sections[sectionId];
          const sectionRelatedContextualizations = relatedContextualizations.filter( ( c ) => c.sectionId === sectionId );
          let sectionChanged;
          const newSection = {
            ...section,
            contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
              const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
              if ( changed && !sectionChanged ) {
                sectionChanged = true;
              }
              return result;
            }, { ...section.contents } ),
            notes: Object.keys( section.notes ).reduce( ( temp1, noteId ) => ( {
              ...temp1,
              [noteId]: {
                ...section.notes[noteId],
                contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                  const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                  if ( changed && !sectionChanged ) {
                    sectionChanged = true;
                  }
                  return result;
                }, { ...section.notes[noteId].contents } )
              }
            } ), {} )
          };
          if ( sectionChanged ) {
            return {
              ...tempSections,
              [sectionId]: newSection
            };
          }
          return tempSections;
        }, {} );
        Object.keys( changedSections ).forEach( ( sectionId ) => {
          updateSection( {
            sectionId,
            storyId: story.id,
            userId,
            section: changedSections[sectionId],
          } );
        } );

       setPromptedToDeleteResourceId( undefined );
      }

      // deleting the resource
      if ( resource.metadata.type === 'image' || resource.metadata.type === 'table' ) {
        deleteUploadedResource( payload );
      }
      else {
        deleteResource( payload );
      }
      setPromptedToDeleteResourceId( undefined );
    };

    const handleSetCoverImage = ( resourceId ) => {
      if ( resourceId !== coverImageId ) {
        setCoverImage( {
          storyId,
          resourceId,
          userId
        } );
      }
      else {
        setCoverImage( {
          storyId,
          resourceId: undefined,
          userId
        } );
      }
    };

    const handleDeleteResourcesPromptedToDelete = () => {
      setIsBatchDeleting( true );

      /*
       * cannot mutualize with single resource deletion for now
       * because section contents changes must be done all in the same time
       * @todo try to factor this
       * actualResourcesPromptedToDelete.forEach(handleDeleteResourceConfirm);
       * 1. delete entity mentions
       * we need to do it all at once to avoid discrepancies
       */
      const finalChangedSections = actualResourcesPromptedToDelete.reduce( ( tempFinalSections, resourceId ) => {
        const resource = resources[resourceId];
        if ( !resource || resourcesLockMap[resource.id] ) {
          return;
        }
        // deleting entities in content states
        const relatedContextualizations = Object.keys( story.contextualizations ).map( ( c ) => story.contextualizations[c] )
          .filter( ( contextualization ) => {
            return contextualization.resourceId === resourceId;
          } );

        const relatedContextualizationsIds = relatedContextualizations.map( ( c ) => c.id );
        const relatedContextualizationsSectionIds = uniq( relatedContextualizations.map( ( c ) => c.sectionId ) );

        if ( relatedContextualizationsIds.length ) {
          const changedSections = relatedContextualizationsSectionIds.reduce( ( tempSections, sectionId ) => {
            const section = tempSections[sectionId] || story.sections[sectionId];
            const sectionRelatedContextualizations = relatedContextualizations.filter( ( c ) => c.sectionId === sectionId );
            let sectionChanged;
            const newSection = {
              ...section,
              contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                if ( changed && !sectionChanged ) {
                  sectionChanged = true;
                }
                return result;
              }, { ...( section.contents || {} ) } ),
              notes: Object.keys( section.notes ).reduce( ( temp1, noteId ) => ( {
                ...temp1,
                [noteId]: {
                  ...section.notes[noteId],
                  contents: sectionRelatedContextualizations.reduce( ( temp, cont ) => {
                    const { changed, result } = removeContextualizationReferenceFromRawContents( temp, cont.id );
                    if ( changed && !sectionChanged ) {
                      sectionChanged = true;
                    }
                    return result;
                  }, { ...section.notes[noteId].contents } )
                }
              } ), {} )
            };
            if ( sectionChanged ) {
              return {
                ...tempSections,
                [sectionId]: newSection
              };
            }
            return tempSections;
          }, tempFinalSections );

          if ( Object.keys( changedSections ).length ) {
            return {
              ...tempFinalSections,
              ...changedSections
            };
          }
        }
        return tempFinalSections;
      }, {} );

      Object.keys( finalChangedSections || {} ).reduce( ( cur, sectionId ) => {
        return cur.
        then( () => new Promise( ( resolve, reject ) => {
          updateSection( {
            sectionId,
            storyId: story.id,
            userId,
            section: finalChangedSections[sectionId],
          }, ( err ) => {
            if ( err ) {
              reject( err );
            }
            else resolve();
          } );
        } ) );

      }, Promise.resolve() )
      // 2. delete the resources
      .then( () => {
        return actualResourcesPromptedToDelete.reduce( ( cur, resourceId, index ) => {
          return cur.then( () => {
            return new Promise( ( resolve ) => {
              const resource = resources[resourceId];
              const payload = {
                storyId,
                userId,
                resourceId
              };
              setResourceDeleteStep( index );
              // deleting the resource
              if ( resource.metadata.type === 'image' || resource.metadata.type === 'table' ) {
                deleteUploadedResource( payload, ( err ) => {
                  if ( err ) {
                    // reject(err);
                    console.error( err );/* eslint no-console : 0*/
                  }
                  resolve();
                } );
              }
              else {
                deleteResource( payload, ( err ) => {
                  if ( err ) {
                    console.error( err );/* eslint no-console : 0*/
                    // reject(err);
                  }
                  resolve();
                } );
              }
            } );
          } );
        }, Promise.resolve() );
      } )
      .then( () => {
        setResourceDeleteStep( 0 );
        setResourcesPromptedToDelete( [] );
        setSelectedResourcesIds( [] );
        setIsBatchDeleting( false );
        setPromptedToDeleteResourceId( undefined );
      } )
      .catch( ( err ) => {
        setResourceDeleteStep( 0 );
        setResourcesPromptedToDelete( [] );
        setSelectedResourcesIds( [] );
        setIsBatchDeleting( false );
        setPromptedToDeleteResourceId( undefined );
        console.error( err );/* eslint no-console : 0 */
      } );

    };

    /**
     * UI case 1 : user edits a resource
     */
    if ( userLockedResourceId ) {
      const handleSubmit = ( resource ) => {
        const { id: resourceId } = resource;
        const payload = {
          resourceId,
          resource,
          storyId,
          userId
        };
        if ( ( resource.metadata.type === 'image' && resource.data.base64 ) || ( resource.metadata.type === 'table' && resource.data.json ) ) {
          uploadResource( payload, 'update' );
        }
        else if ( resource.metadata.type === 'bib' ) {
          createBibData( resource, this.props );
        }
        else {
          updateResource( payload );
        }
        leaveBlock( {
          storyId,
          userId,
          blockType: 'resources',
          blockId: userLockedResourceId
        } );
      };
      const handleCancel = () => {
        leaveBlock( {
          storyId,
          userId,
          blockType: 'resources',
          blockId: userLockedResourceId
        } );
      };
      return (
        <ResourceForm
          onCancel={ handleCancel }
          onSubmit={ handleSubmit }
          bigSelectColumnsNumber={ 3 }
          resource={ resources[userLockedResourceId] }
          asNewResource={ false }
        />
      );
    }
    switch ( mainColumnMode ) {

      /**
       * UI case 2 : user creates a new resource
       */
      case 'new':
        const handleSubmit = ( resource ) => {
          const resourceId = genId();
          const payload = {
            resourceId,
            resource: {
              ...resource,
              id: resourceId
            },
            storyId,
            userId,
          };
          if ( ( resource.metadata.type === 'image' && resource.data.base64 ) || ( resource.metadata.type === 'table' && resource.data.json ) ) {
            uploadResource( payload, 'create' );
          }
          else if ( resource.metadata.type === 'bib' ) {
            setUploadStatus( {
              status: 'initializing',
              errors: []
            } );
            setTimeout( () => {
              createBibData( resource, this.props )
                .then( () => {
                  setUploadStatus( undefined );
                } )
                .catch( ( e ) => {
                  console.error( e );/* eslint no-console : 0 */
                  setUploadStatus( undefined );
                } );
            }, 100 );
          }
          else {
            createResource( payload );
          }
          setMainColumnMode( 'list' );
        };
        const handleSetMainColumnToList = () => setMainColumnMode( 'list' );
        return (
          <ResourceForm
            onCancel={ handleSetMainColumnToList }
            onSubmit={ handleSubmit }
            bigSelectColumnsNumber={ 3 }
            asNewResource
          />
        );

      /**
       * UI case 3 : user browses list of resources
       */
      case 'list':
      default:
        const setOption = ( option, optionDomain ) => {
          if ( optionDomain === 'filter' ) {
            handleFilterToggle( option );
          }
          else if ( optionDomain === 'sort' ) {
            setSortValue( option );
            setOptionsVisible( false );
          }
          else if ( optionDomain === 'status' ) {
            setStatusFilterValue( option );
            setOptionsVisible( false );
          }
        };
        const handleResourceSearchChange = ( e ) => this.setResourceSearchStringDebounce( e.target.value );
        const handleToggleOptionsVisibility = () => {
                          setOptionsVisible( !optionsVisible );
                        };
        const handleSelectAllVisibleResources = () => setSelectedResourcesIds( visibleResources.map( ( res ) => res.id ).filter( ( id ) => !resourcesLockMap[id] ) );
        const handleDeselectAllVisibleResources = () => setSelectedResourcesIds( [] );
        const handleDeleteSelection = () => setResourcesPromptedToDelete( [ ...selectedResourcesIds ] );
        const renderNoResource = () => <div>{translate( 'No item in your library yet' )}</div>;
        const renderResourceInList = ( resource ) => {
          const handleEdit = () => {
            enterBlock( {
              storyId,
              userId,
              blockType: 'resources',
              blockId: resource.id
            } );
          };
          const handleDelete = () => {
            setPromptedToDeleteResourceId( resource.id );
          };
          const isSelected = selectedResourcesIds.indexOf( resource.id ) > -1;
          const handleClick = () => {
            let newSelectedResourcesIds;
            if ( resourcesLockMap[resource.id] === undefined ) {
              if ( isSelected ) {
                newSelectedResourcesIds = selectedResourcesIds.filter( ( id ) => id !== resource.id );
              }
              else {
                newSelectedResourcesIds = [ ...selectedResourcesIds, resource.id ];
              }
              setSelectedResourcesIds( newSelectedResourcesIds );
            }
          };
          return (
            <ResourceCard
              isActive={ isSelected }
              isSelectable={ !resourcesLockMap[resource.id] }
              onClick={ handleClick }
              onEdit={ handleEdit }
              onDelete={ handleDelete }
              coverImageId={ coverImageId }
              handleSetCoverImage={ handleSetCoverImage }
              resource={ resource }
              getTitle={ getResourceTitle }
              lockData={ resourcesLockMap[resource.id] }
              key={ resource.id }
            />
          );
        };
        const handleAbortResourceDeletion = () => setPromptedToDeleteResourceId( undefined );
        const handleAbortResourcesDeletion = () => setResourcesPromptedToDelete( [] );
        return (
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem>
              <Level />
              <Column style={ { paddingRight: 0 } }>
                <LibraryFiltersBar
                  filterValues={ filterValues }
                  onDeleteSelection={ handleDeleteSelection }
                  onDeselectAllVisibleResources={ handleDeselectAllVisibleResources }
                  onSearchStringChange={ handleResourceSearchChange }
                  searchString={ this.state.searchString }
                  onSelectAllVisibleResources={ handleSelectAllVisibleResources }
                  onToggleOptionsVisibility={ handleToggleOptionsVisibility }
                  optionsVisible={ optionsVisible }
                  resourceTypes={ resourceTypes }
                  selectedResourcesIds={ selectedResourcesIds }
                  setOptions={ setOption }
                  sortValue={ sortValue }
                  statusFilterValue={ statusFilterValue }
                  statusFilterValues={ statusFilterValues }
                  translate={ translate }
                  visibleResources={ visibleResources }
                />
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem isFlex={ 1 }>
              <StretchedLayoutContainer
                isAbsolute
                isDirection={ 'vertical' }
              >
                <PaginatedList
                  items={ visibleResources }
                  itemsPerPage={ 30 }
                  style={ { height: '100%' } }
                  renderNoItem={ renderNoResource }
                  renderItem={ renderResourceInList }
                />
              </StretchedLayoutContainer>
            </StretchedLayoutItem>
            <ConfirmToDeleteModal
              isActive={ promptedToDeleteResourceId !== undefined }
              isDisabled={ resourcesLockMap[promptedToDeleteResourceId] }
              deleteType={ 'resource' }
              story={ story }
              id={ promptedToDeleteResourceId }
              onClose={ handleAbortResourceDeletion }
              onDeleteConfirm={ handleDeleteResourceConfirm }
            />
            <ConfirmBatchDeleteModal
              translate={ translate }
              isActive={ actualResourcesPromptedToDelete.length > 0 }
              actualResourcesPromptedToDelete={ actualResourcesPromptedToDelete }
              resourcesPromptedToDelete={ resourcesPromptedToDelete }
              endangeredContextualizationsLength={ endangeredContextualizationsLength }
              onDelete={ handleDeleteResourcesPromptedToDelete }
              onCancel={ handleAbortResourcesDeletion }
            />
          </StretchedLayoutContainer>
      );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      editedStory: story = {},
      userId,
      lockingMap = {},
      activeUsers,

      mainColumnMode,
      resourcesPromptedToDelete,
      isBatchDeleting,
      resourceDeleteStep,
      actions: {
        setMainColumnMode,
      },
      submitMultiResources,
    } = this.props;
    const { t } = this.context;
    const {
      contextualizations = {},
      id: storyId,
    } = story;

    /**
     * Computed variables
     */
    const userLockedResourceId = getUserResourceLockId( lockingMap, userId, storyId );
    const reverseResourcesLockMap = getReverseResourcesLockMap( lockingMap, activeUsers, storyId );
    const reverseSectionLockMap = getReverseSectionsLockMap( lockingMap, activeUsers, storyId );
    const reverseResourcesSectionsMap =
      Object.keys( contextualizations )
      .reduce( ( result, contextId ) => {
        const context = contextualizations[contextId];
        const activeCitedSections =
          getCitedSections( contextualizations, context.resourceId )
            .filter( ( id ) => {
              return ( reverseSectionLockMap[id] && reverseSectionLockMap[id].userId !== userId );
            } );
        if ( activeCitedSections.length > 0 ) {
          return {
            ...result,
            [context.resourceId]: { name: `other ${activeCitedSections.length} sections` }
          };
        }
        return result;
      }, {} );
    const resourcesLockMap = isEmpty( reverseResourcesLockMap ) ? reverseResourcesSectionsMap : reverseResourcesLockMap;
    const actualResourcesPromptedToDelete = resourcesPromptedToDelete.filter( ( resourceId ) => resourcesLockMap[resourceId] === undefined );

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.LibraryView' );

    /**
     * Callbacks handlers
     */
    const handleNewResourceClick = () => {
      if ( mainColumnMode === 'new' ) {
        setMainColumnMode( 'list' );
      }
      else setMainColumnMode( 'new' );
    };

    return (
      <Container style={ { position: 'relative', height: '100%' } }>
        <StretchedLayoutContainer
          isFluid
          isDirection={ 'horizontal' }
          isAbsolute
        >
          <StretchedLayoutItem
            className={ 'is-hidden-mobile' }
            isFlex={ '1' }
          >
            <Column>
              <Level />
              <Level>
                <Content>
                  {translate( 'Your library contains all the items that can be used within the story.' )}
                </Content>
              </Level>
              <Level>
                <Button
                  isDisabled={ userLockedResourceId !== undefined }
                  isFullWidth
                  onClick={ handleNewResourceClick }
                  isColor={ mainColumnMode === 'new' ? 'primary' : 'info' }
                >
                  {translate( 'New resource' )}
                </Button>
              </Level>
              <Level>
                <DropZone
                  onDrop={ submitMultiResources }
                  accept={ '.jpeg,.jpg,.gif,.png,.csv,.tsv,.bib' }
                >
                  {translate( 'Drop files to include in your library' )}
                  <HelpPin place={ 'right' }>
                    {`${translate( 'Accepted file formats: jpeg, jpg, gif, png, csv, tsv, bib' )}. ${translate( 'Up to {n} files, with a maximum size of {s} Mb each', {
                        n: maxBatchNumber,
                        s: Math.floor( realMaxFileSize / 1000000 )
                      } )}`}
                  </HelpPin>
                </DropZone>
              </Level>
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={ '3' }>
            <Column isWrapper>
              {this.renderMainColumn()}
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>

        <ModalCard
          isActive={ isBatchDeleting }
          headerContent={ translate( [ 'Deleting an item', 'Deleting {n} items', 'n' ], { n: actualResourcesPromptedToDelete.length } ) }
          mainContent={
            <div>
              {translate( 'Deleting item {k} of {n}', { k: resourceDeleteStep + 1, n: actualResourcesPromptedToDelete.length } )}
            </div>
          }
        />
      </Container>
    );
  }
}

LibraryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default LibraryViewLayout;
