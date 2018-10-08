/**
 * This module provides the aside/secondary column for the main column of the editor
 * @module fonio/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import {
  Column,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
  Delete,
  DropZone,
  HelpPin,
  Tabs,
  TabList,
  Tab,
  TabLink,
  Level,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  base64ToBytesLength
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import NewSectionForm from '../../../components/NewSectionForm';
import ResourceForm from '../../../components/ResourceForm';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const { maxBatchNumber, maxResourceSize } = config;
const realMaxFileSize = base64ToBytesLength( maxResourceSize );

const MainSectionAside = ( {
  userLockedResourceId,
  uploadResource,
  createBibData,
  story = {},
  userId,
  uploadStatus,
  createResource,
  updateResource,
  setUploadStatus,
  leaveBlock,
  resources,
  setMainColumnMode,
  mainColumnMode,
  setNewResourceMode,
  newResourceMode,
  defaultSectionMetadata,
  onNewSectionSubmit,
  handleUpdateMetadata,
  section,
  newResourceType,
  guessTitle,
  submitMultiResources,
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );

  /**
   * Computed variables
   */
  const { id: storyId } = story;

  /**
   * Callbacks handlers
   */
  const handleSubmitExistingResource = ( resource ) => {
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
      createBibData( resource, {
        editedStory: story,
        userId,
        uploadStatus,
        actions: {
          createResource,
          updateResource,
          setUploadStatus,
        },
      } );
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
  const handleCancelResourceEdition = () => {
    leaveBlock( {
      storyId,
      userId,
      blockType: 'resources',
      blockId: userLockedResourceId
    } );
  };
  const handleSetMainColumnModeEdition = () => setMainColumnMode( 'edition' );

  // CASE 1 : a resource is edited
  if ( userLockedResourceId ) {

    return (
      <Column style={ { position: 'relative', height: '100%', width: '100%', background: 'white', zIndex: 3 } }>
        <StretchedLayoutContainer isAbsolute>
          <StretchedLayoutItem isFlex={ 1 }>
            <Column style={ { position: 'relative', height: '100%', width: '100%' } }>
              <ResourceForm
                onCancel={ handleCancelResourceEdition }
                onSubmit={ handleSubmitExistingResource }
                resource={ resources[userLockedResourceId] }
                asNewResource={ false }
              />
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Column>
    );
  }
  const handleSubmitNewResource = ( resource ) => {
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
          createBibData( resource, {
            editedStory: story,
            userId,
            uploadStatus,
            actions: {
              createResource,
              updateResource,
              setUploadStatus
            },
          } )
          .then( () =>
            setUploadStatus( undefined )
          )
          .catch( ( e ) => {
            console.error( e );/* eslint no-console : 0 */
            setUploadStatus( undefined );
          } );
      }, 100 );

    }
    else {
      createResource( payload );
    }
    setMainColumnMode( 'edition' );
  };

  const handleSetNewResourceModeToManual = () => setNewResourceMode( 'manually' );
  const handleSetNewResourceModeToDrop = () => setNewResourceMode( 'drop' );

  switch ( mainColumnMode ) {
    // CASE 1 : a new resource is configured
    case 'newresource':
      return (
        <Column
          isWrapper
          style={ { background: 'white', zIndex: 2 } }
        >
          <StretchedLayoutContainer
            style={ { paddingTop: '1rem' } }
            isAbsolute
          >
            <StretchedLayoutItem>
              <StretchedLayoutItem>
                <Column>
                  <Title isSize={ 3 }>
                    <StretchedLayoutContainer isDirection={ 'horizontal' }>
                      <StretchedLayoutItem isFlex={ 10 }>
                        {translate( 'Add items to the library' )}
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        <Delete onClick={ handleSetMainColumnModeEdition } />
                      </StretchedLayoutItem>
                    </StretchedLayoutContainer>
                  </Title>
                </Column>
                <Level />
              </StretchedLayoutItem>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <Column>
                <Tabs isBoxed>
                  <TabList>
                    <Tab
                      onClick={ handleSetNewResourceModeToManual }
                      isActive={ newResourceMode === 'manually' }
                    >
                      <TabLink>
                        {translate( 'One item' )}
                      </TabLink>
                    </Tab>
                    <Tab
                      onClick={ handleSetNewResourceModeToDrop }
                      isActive={ newResourceMode === 'drop' }
                    >
                      <TabLink>
                        {translate( 'Several items' )}
                      </TabLink>
                    </Tab>
                  </TabList>
                </Tabs>
              </Column>
            </StretchedLayoutItem>
            {newResourceMode === 'manually' &&
              <StretchedLayoutItem isFlex={ 1 }>
                <Column isWrapper>
                  <ResourceForm
                    showTitle={ false }
                    resourceType={ newResourceType }
                    onCancel={ handleSetMainColumnModeEdition }
                    onSubmit={ handleSubmitNewResource }
                    asNewResource
                  />
                </Column>
              </StretchedLayoutItem>
            }
            {newResourceMode === 'drop' &&
              <StretchedLayoutItem>
                <Column>
                  <DropZone
                    accept={ '.jpeg,.jpg,.gif,.png,.csv,.tsv,.bib' }
                    style={ { height: '5rem' } }
                    onDrop={ submitMultiResources }
                  >
                    {translate( 'Drop files here to include in your library' )}
                    <HelpPin>
                      {`${translate( 'Accepted file formats: jpeg, jpg, gif, png, csv, tsv, bib' )}. ${translate( 'Up to {n} files, with a maximum size of {s} Mb each', {
                        n: maxBatchNumber,
                        s: Math.floor( realMaxFileSize / 1000000 )
                      } )}`}
                    </HelpPin>
                  </DropZone>
                </Column>
              </StretchedLayoutItem>
            }
          </StretchedLayoutContainer>
        </Column>
      );
  // CASE 3 : a new section is edited
    case 'newsection':
      return (
        <Column
          isWrapper
          style={ { background: 'white', zIndex: 1000 } }
        >
          <StretchedLayoutContainer
            style={ { paddingTop: '1rem' } }
            isAbsolute
          >
            <StretchedLayoutItem>
              <Column>
                <Title isSize={ 3 }>
                  <StretchedLayoutContainer isDirection={ 'horizontal' }>
                    <StretchedLayoutItem isFlex={ 10 }>
                      {translate( 'New section' )}
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Delete onClick={ handleSetMainColumnModeEdition } />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Title>
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem
              isFlowing
              isFlex={ 1 }
            >
              <Column>
                <NewSectionForm
                  metadata={ {
                    ...defaultSectionMetadata,
                    title: guessTitle( section.metadata.title )
                  } }
                  onSubmit={ onNewSectionSubmit }
                  onCancel={ handleSetMainColumnModeEdition }
                />
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>
      );
    // CASE 4 : section metadata is edited
    case 'editmetadata':
      return (
        <Column
          isWrapper
          style={ { background: 'white', zIndex: 1000 } }
        >
          <StretchedLayoutContainer
            style={ { paddingTop: '1rem' } }
            isAbsolute
          >
            <StretchedLayoutItem>
              <Column>
                <Title isSize={ 3 }>
                  <StretchedLayoutContainer isDirection={ 'horizontal' }>
                    <StretchedLayoutItem isFlex={ 10 }>
                      {translate( 'Edit section metadata' )}
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Delete onClick={ handleSetMainColumnModeEdition } />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Title>
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem
              isFlowing
              isFlex={ 1 }
            >
              <Column>
                <NewSectionForm
                  submitMessage={ translate( 'Save changes' ) }
                  metadata={ { ...section.metadata } }
                  onSubmit={ handleUpdateMetadata }
                  onCancel={ handleSetMainColumnModeEdition }
                />
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>
      );
    // CASE 5 : nothing is edited
    default:
      return null;
  }
};

MainSectionAside.contextTypes = {
  t: PropTypes.func.isRequired,
};

export default MainSectionAside;
