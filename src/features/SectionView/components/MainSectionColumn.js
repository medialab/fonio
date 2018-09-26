/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import {
  Column,
  Delete,
  DropZone,
  HelpPin,
  Level,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Tab,
  TabLink,
  TabList,
  Tabs,
  Title,
} from 'quinoa-design-library/components/';

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
import SectionEditor from '../../../components/SectionEditor';
import NewSectionForm from '../../../components/NewSectionForm';
import ResourceForm from '../../../components/ResourceForm';
import { createBibData } from '../../../helpers/resourcesUtils';
import SectionHeader from './SectionHeader';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const { maxBatchNumber, maxResourceSize } = config;
const realMaxFileSize = base64ToBytesLength( maxResourceSize );

const MainSectionColumn = ( {
  userLockedResourceId,
  mainColumnMode,
  newResourceMode,
  defaultSectionMetadata,

  uploadStatus,

  story,
  section,
  userId,

  editorStates,
  editorFocus,
  assetRequestState,
  draggedResourceId,
  previousEditorFocus,

  newResourceType,
  storyIsSaved,

  updateSection,

  setMainColumnMode,
  setShortcutsHelpVisible,
  onNewSectionSubmit,

  promptAssetEmbed,
  unpromptAssetEmbed,
  setEditorFocus,

  createContextualization,
  createContextualizer,
  createResource,
  uploadResource,

  setEditorPastingStatus,
  editorPastingStatus,

  leaveBlock,

  updateDraftEditorState,
  updateDraftEditorsStates,
  setNewResourceMode,

  updateContextualizer,
  updateResource,
  deleteContextualization,
  deleteContextualizer,
  deleteContextualizationFromId,

  setUploadStatus,

  setEditorBlocked,
  setStoryIsSaved,
  setErrorMessage,
  setAssetRequestContentId,
  startNewResourceConfiguration,
  startExistingResourceConfiguration,

  submitMultiResources,

  onOpenSectionSettings,

  summonAsset,

  selectedContextualizationId,
  setSelectedContextualizationId,
}, {
  t
} ) => {

  const {
    id: storyId,
    resources,
  } = story;
  // const {id: sectionId} = section;
  const translate = translateNameSpacer( t, 'Features.SectionView' );

  const handleUpdateSection = ( newSection, callback ) => {
    updateSection( newSection, callback );
  };

  const handleUpdateMetadata = ( metadata ) => {
    handleUpdateSection( {
      ...section,
      metadata: {
        ...section.metadata,
        ...metadata
      }
    } );
    setMainColumnMode( 'edition' );
  };

  const handleTitleBlur = ( title ) => {
    if ( title.length ) {
      const newSection = {
        ...section,
        metadata: {
          ...section.metadata,
          title
        }
      };
      handleUpdateSection( newSection );
    }
  };

  const handleTitleFocus = () => {
    setEditorFocus( undefined );
  };

  const guessTitle = ( title = '' ) => {
    const endNumberRegexp = /([0-9]+)$/;
    const numberMatch = title.match( endNumberRegexp );
    if ( numberMatch ) {
      const number = +numberMatch[1];
      if ( !isNaN( number ) ) {
        const newNumber = number + 1;
        const newTitle = title.replace( endNumberRegexp, `${newNumber }` );
        return newTitle;
      }
    }
    return '';
  };

  const renderMain = () => {
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
      const handleCancel = () => {
        leaveBlock( {
          storyId,
          userId,
          blockType: 'resources',
          blockId: userLockedResourceId
        } );
      };
      return (
        <Column style={ { position: 'relative', height: '100%', width: '100%', background: 'white', zIndex: 3 } }>
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem isFlex={ 1 }>
              <Column style={ { position: 'relative', height: '100%', width: '100%' } }>
                <ResourceForm
                  onCancel={ handleCancel }
                  onSubmit={ handleSubmit }
                  resource={ resources[userLockedResourceId] }
                  asNewResource={ false }
                />
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>
      );
    }
    const handleSetMainColumnModeEdition = () => setMainColumnMode( 'edition' );

    switch ( mainColumnMode ) {
      case 'newresource':
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
                      onSubmit={ handleSubmit }
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
      default:
        return null;
    }
  };

  const handleEditMetadataClick = () => {
    if ( mainColumnMode !== 'editmetadata' ) {
      onOpenSectionSettings( section.id );
    }
    else {
      setMainColumnMode( 'edition' );
    }
  };

  const editorWidth = {
    mobile: mainColumnMode === 'edition' && !userLockedResourceId ? 10 : 12,
    tablet: mainColumnMode === 'edition' && !userLockedResourceId ? 10 : 12,
    widescreen: mainColumnMode === 'edition' && !userLockedResourceId ? 8 : 12
  };
  const editorX = {
    mobile: mainColumnMode === 'edition' && !userLockedResourceId ? 1 : 0,
    tablet: mainColumnMode === 'edition' && !userLockedResourceId ? 1 : 0,
    widescreen: mainColumnMode === 'edition' && !userLockedResourceId ? 2 : 0
  };
  const handleOpenShortcutsHelp = () => setShortcutsHelpVisible( true );

  return (
    <Column
      isSize={ 'fullwidth' }
      isWrapper
    >
      <StretchedLayoutContainer
        isFluid
        isAbsolute
        isDirection={ 'horizontal' }
      >
        <StretchedLayoutItem isFlex={ mainColumnMode === 'edition' && !userLockedResourceId ? 0 : 6 }>
          {renderMain()}
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={ mainColumnMode === 'edition' && !userLockedResourceId ? 12 : 6 }>
          <Column
            isWrapper
            isSize={ 12 }
            isOffset={ 0 }
          >
            <StretchedLayoutContainer
              isAbsolute
              isDirection={ 'vertical' }
            >
              <StretchedLayoutItem>
                <Column
                  isSize={ editorWidth }
                  isOffset={ editorX }
                  style={ { paddingBottom: 0 } }
                  isWrapper
                >
                  {/* editor header*/}
                  <StretchedLayoutContainer
                    style={ { overflow: 'visible' } }
                    isFluid
                    isDirection={ 'horizontal' }
                  >
                    <StretchedLayoutItem
                      style={ { overflow: 'visible' } }
                      isFlex={ 1 }
                    >
                      <SectionHeader
                        title={ section.metadata.title }
                        onEdit={ handleEditMetadataClick }
                        onBlur={ handleTitleBlur }
                        onFocus={ handleTitleFocus }
                        placeHolder={ translate( 'Section title' ) }

                        isDisabled={ userLockedResourceId || ( mainColumnMode !== 'edition' && mainColumnMode !== 'editmetadata' ) }
                        isColor={ mainColumnMode === 'editmetadata' ? 'primary' : '' }
                        editTip={ translate( 'Edit section metadata' ) }
                        inputTip={ translate( 'Section title' ) }
                      />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
              </StretchedLayoutItem>
              {/*editor*/}
              <StretchedLayoutItem isFlex={ 1 }>
                <Column isWrapper>
                  <SectionEditor
                    editorWidth={ editorWidth }
                    editorOffset={ editorX }
                    style={ { height: '100%' } }
                    story={ story }
                    activeSection={ section }
                    sectionId={ section.id }
                    editorStates={ editorStates }
                    updateDraftEditorState={ updateDraftEditorState }
                    updateDraftEditorsStates={ updateDraftEditorsStates }
                    editorFocus={ editorFocus }
                    previousEditorFocus={ previousEditorFocus }
                    userId={ userId }
                    draggedResourceId={ draggedResourceId }
                    disablePaste={ ( userLockedResourceId || mainColumnMode !== 'edit' ) && !editorFocus }

                    updateSection={ handleUpdateSection }

                    summonAsset={ summonAsset }

                    setEditorPastingStatus={ setEditorPastingStatus }
                    editorPastingStatus={ editorPastingStatus }

                    createContextualization={ createContextualization }
                    createContextualizer={ createContextualizer }
                    createResource={ createResource }

                    selectedContextualizationId={ selectedContextualizationId }
                    setSelectedContextualizationId={ setSelectedContextualizationId }

                    updateContextualizer={ updateContextualizer }
                    updateResource={ updateResource }

                    deleteContextualization={ deleteContextualization }
                    deleteContextualizationFromId={ deleteContextualizationFromId }
                    deleteContextualizer={ deleteContextualizer }

                    requestAsset={ promptAssetEmbed }
                    cancelAssetRequest={ unpromptAssetEmbed }

                    assetRequestState={ assetRequestState }
                    setAssetRequestContentId={ setAssetRequestContentId }
                    assetRequestPosition={ assetRequestState.selection }
                    assetRequestContentId={ assetRequestState.editorId }

                    startNewResourceConfiguration={ startNewResourceConfiguration }
                    startExistingResourceConfiguration={ startExistingResourceConfiguration }
                    setStoryIsSaved={ setStoryIsSaved }
                    setErrorMessage={ setErrorMessage }

                    setEditorBlocked={ setEditorBlocked }
                    setEditorFocus={ setEditorFocus }
                  />

                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem className={ 'editor-footer' }>
                <Column
                  style={ { paddingTop: 0 } }
                  isSize={ editorWidth }
                  isOffset={ editorX }
                >
                  <Column style={ { paddingTop: 0 } }>
                    <StretchedLayoutContainer isDirection={ 'horizontal' }>
                      <StretchedLayoutItem isFlex={ 1 }>
                        <a onClick={ handleOpenShortcutsHelp }>{t( 'shortcuts help' )}</a>
                      </StretchedLayoutItem>
                      <StretchedLayoutItem style={ { textAlign: 'right' } }>
                        <i>{storyIsSaved ? translate( 'All changes saved' ) : translate( 'Saving...' )}</i>
                      </StretchedLayoutItem>
                    </StretchedLayoutContainer>
                  </Column>
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </Column>

        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

MainSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default MainSectionColumn;
