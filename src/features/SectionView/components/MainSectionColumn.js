import React from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';

import SectionEditor from '../../../components/SectionEditor';
import NewSectionForm from '../../../components/NewSectionForm';
import ResourceForm from '../../../components/ResourceForm';
import {createBibData} from '../../../helpers/resourcesUtils';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import config from '../../../config';

import {
  Button,
  Column,
  Delete,
  DropZone,
  HelpPin,
  Tab,
  Level,
  Image,
  TabLink,
  TabList,
  Tabs,
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {
  abbrevString,
  base64ToBytesLength
} from '../../../helpers/misc';

const {maxBatchNumber, maxFileSize} = config;
const realMaxFileSize = base64ToBytesLength(maxFileSize);


const MainSectionColumn = ({
  userLockedResourceId,
  mainColumnMode,
  newResourceMode,
  defaultSectionMetadata,

  story,
  section,
  userId,

  editorStates,
  editorFocus,
  assetRequestState,
  draggedResourceId,

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

  setEditorBlocked,
  setStoryIsSaved,
  setErrorMessage,
  setAssetRequestContentId,
  startNewResourceConfiguration,
  startExistingResourceConfiguration,

  submitMultiResources,

  onOpenSectionSettings,

  summonAsset,
}, {
  t
}) => {


  const {
    id: storyId,
    resources,
  } = story;
  // const {id: sectionId} = section;
  const translate = translateNameSpacer(t, 'Features.SectionView');

  const onUpdateSection = (newSection, callback) => {
    updateSection(newSection, callback);
  };

  const onUpdateMetadata = metadata => {
    onUpdateSection({
      ...section,
      metadata: {
        ...section.metadata,
        ...metadata
      }
    });
    setMainColumnMode('edition');
  };


  const renderMain = () => {
    if (userLockedResourceId) {
      const handleSubmit = resource => {
        const {id: resourceId} = resource;
        const payload = {
          resourceId,
          resource,
          storyId,
          userId
        };
        if ((resource.metadata.type === 'image' && resource.data.base64) || (resource.metadata.type === 'table' && resource.data.json)) {
          uploadResource(payload, 'update');
        }
        else if (resource.metadata.type === 'bib') {
          createBibData(resource, {
            editedStory: story,
            userId,
            actions: {
              createResource,
              updateResource
            },
          });
        }
        else {
          updateResource(payload);
        }
        leaveBlock({
          storyId,
          userId,
          blockType: 'resources',
          blockId: userLockedResourceId
        });
      };
      const handleCancel = () => {
        leaveBlock({
          storyId,
          userId,
          blockType: 'resources',
          blockId: userLockedResourceId
        });
      };
      return (
        <Column style={{position: 'relative', height: '100%', width: '100%', background: 'white', zIndex: 3}}>
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem isFlex={1}>
              <Column style={{position: 'relative', height: '100%', width: '100%'}}>
                <ResourceForm
                  onCancel={handleCancel}
                  onSubmit={handleSubmit}
                  resource={resources[userLockedResourceId]}
                  asNewResource={false} />
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>
      );
    }

    switch (mainColumnMode) {
      case 'newresource':
        const handleSubmit = resource => {
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
          if ((resource.metadata.type === 'image' && resource.data.base64) || (resource.metadata.type === 'table' && resource.data.json)) {
            uploadResource(payload, 'create');
          }
          else if (resource.metadata.type === 'bib') {
            setEditorBlocked(true);
            setTimeout(() => {
                createBibData(resource, {
                  editedStory: story,
                  userId,
                  actions: {
                    createResource,
                    updateResource
                  },
                })
                .then(() =>
                  setEditorBlocked(false)
                );
            }, 100);


          }
          else {
            createResource(payload);
          }
          setMainColumnMode('edition');
        };
        return (
          <Column isWrapper style={{background: 'white', zIndex: 2}}>
            <StretchedLayoutContainer isAbsolute>
              <StretchedLayoutItem>
                <StretchedLayoutItem>
                  <Column>
                    <Title isSize={3}>
                      <StretchedLayoutContainer isDirection="horizontal">
                        <StretchedLayoutItem isFlex={10}>
                          {translate('Add items to the library')}
                        </StretchedLayoutItem>
                        <StretchedLayoutItem>
                          <Delete onClick={
                            () => setMainColumnMode('edition')
                          } />
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
                      <Tab onClick={() => setNewResourceMode('manually')} isActive={newResourceMode === 'manually'}>
                        <TabLink>
                          {translate('Manually')}
                        </TabLink>
                      </Tab>
                      <Tab onClick={() => setNewResourceMode('drop')} isActive={newResourceMode === 'drop'}>
                        <TabLink>
                          {translate('From files drop')}
                        </TabLink>
                      </Tab>
                    </TabList>
                  </Tabs>
                </Column>
              </StretchedLayoutItem>
              {newResourceMode === 'manually' && <StretchedLayoutItem isFlex={1}>
                <Column isWrapper>
                  <ResourceForm
                    showTitle={false}
                    resourceType={newResourceType}
                    onCancel={() => setMainColumnMode('edition')}
                    onSubmit={handleSubmit}
                    asNewResource />
                </Column>
              </StretchedLayoutItem>}
              {newResourceMode === 'drop' && <StretchedLayoutItem>
                <Column>
                  <DropZone
                    accept=".jpeg,.jpg,.gif,.png,.csv,.tsv,.bib"
                    style={{height: '5rem'}}
                    onDrop={submitMultiResources}>
                    {translate('Drop files here to include in your library')}
                    <HelpPin>
                      {`${translate('Accepted file formats: jpeg, jpg, gif, png, csv, tsv, bib')}. ${translate('Up to {n} files, with a maximum size of {s} Mb each', {
                        n: maxBatchNumber,
                        s: Math.floor(realMaxFileSize / 1000000)
                      })}`}
                    </HelpPin>
                  </DropZone>
                </Column>
              </StretchedLayoutItem>}
            </StretchedLayoutContainer>
          </Column>
        );
      case 'newsection':
        return (
          <Column isWrapper style={{background: 'white', zIndex: 1000}}>
            <StretchedLayoutContainer isAbsolute>
              <StretchedLayoutItem>
                <Column>
                  <Title isSize={3}>
                    <StretchedLayoutContainer isDirection="horizontal">
                      <StretchedLayoutItem isFlex={10}>
                        {translate('New section')}
                      </StretchedLayoutItem>
                      <StretchedLayoutItem>
                        <Delete onClick={() => setMainColumnMode('edition')} />
                      </StretchedLayoutItem>
                    </StretchedLayoutContainer>
                  </Title>
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem isFlowing isFlex={1}>
                <Column>
                  <NewSectionForm
                    metadata={{...defaultSectionMetadata}}
                    onSubmit={onNewSectionSubmit}
                    onCancel={() => setMainColumnMode('edition')} />
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </Column>
        );
      case 'editmetadata':
        return (<Column isWrapper style={{background: 'white', zIndex: 1000}}>
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem>
              <Column>
                <Title isSize={3}>
                  <StretchedLayoutContainer isDirection="horizontal">
                    <StretchedLayoutItem isFlex={10}>
                      {translate('Edit section metadata')}
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Delete onClick={() => setMainColumnMode('edition')} />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Title>
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem isFlowing isFlex={1}>
              <Column>
                <NewSectionForm
                  submitMessage={translate('Save changes')}
                  metadata={{...section.metadata}}
                  onSubmit={onUpdateMetadata}
                  onCancel={() => setMainColumnMode('edition')} />
              </Column>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>);
      default:
        return null;
    }
  };

  const onEditMetadataClick = () => {
    if (mainColumnMode !== 'editmetadata') {
      onOpenSectionSettings(section.id);
    }
 else {
      setMainColumnMode('edition');
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

  return (
    <Column isSize={'fullwidth'} isWrapper>
      <StretchedLayoutContainer isFluid isAbsolute isDirection="horizontal">

        <StretchedLayoutItem isFlex={mainColumnMode === 'edition' && !userLockedResourceId ? 0 : 6}>
          {renderMain()}
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={mainColumnMode === 'edition' && !userLockedResourceId ? 12 : 6}>
          <Column
            isWrapper isSize={12}
            isOffset={0}>
            <StretchedLayoutContainer isAbsolute isDirection="vertical">
              <StretchedLayoutItem>
                <Column
                  isSize={editorWidth}
                  isOffset={editorX} isWrapper>
                  {/* editor header*/}
                  <StretchedLayoutContainer isFluid isDirection={'horizontal'}>
                    <StretchedLayoutItem isFlex={1}>
                      <Title isSize={2}>
                        {abbrevString(section.metadata.title, 20)}
                      </Title>
                    </StretchedLayoutItem>
                    <StretchedLayoutItem style={{padding: '.5rem'}}>
                      <Button
                        isRounded
                        isDisabled={userLockedResourceId || (mainColumnMode !== 'edition' && mainColumnMode !== 'editmetadata')}
                        isColor={mainColumnMode === 'editmetadata' ? 'primary' : ''}
                        data-tip={translate('Edit section metadata')}
                        data-for="tooltip"
                        onClick={onEditMetadataClick}>
                        <Image isSize={'24x24'} src={mainColumnMode === 'editmetadata' ? icons.edit.white.svg : icons.edit.black.svg} />
                      </Button>
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
              </StretchedLayoutItem>
              {/*editor*/}
              <StretchedLayoutItem isFlex={1}>
                <Column isWrapper>
                  <SectionEditor
                    editorWidth={editorWidth}
                    editorOffset={editorX}
                    style={{height: '100%'}}
                    story={story}
                    activeSection={section}
                    sectionId={section.id}
                    editorStates={editorStates}
                    updateDraftEditorState={updateDraftEditorState}
                    updateDraftEditorsStates={updateDraftEditorsStates}
                    editorFocus={editorFocus}
                    userId={userId}
                    draggedResourceId={draggedResourceId}
                    disablePaste={(userLockedResourceId || mainColumnMode !== 'edit') && !editorFocus}

                    updateSection={(newSection, callback) => onUpdateSection(newSection, callback)}

                    summonAsset={summonAsset}

                    setEditorPastingStatus={setEditorPastingStatus}
                    editorPastingStatus={editorPastingStatus}

                    createContextualization={createContextualization}
                    createContextualizer={createContextualizer}
                    createResource={createResource}

                    updateContextualizer={updateContextualizer}
                    updateResource={updateResource}

                    deleteContextualization={deleteContextualization}
                    deleteContextualizationFromId={deleteContextualizationFromId}
                    deleteContextualizer={deleteContextualizer}

                    requestAsset={promptAssetEmbed}
                    cancelAssetRequest={unpromptAssetEmbed}

                    assetRequestState={assetRequestState}
                    setAssetRequestContentId={setAssetRequestContentId}
                    assetRequestPosition={assetRequestState.selection}
                    assetRequestContentId={assetRequestState.editorId}

                    startNewResourceConfiguration={startNewResourceConfiguration}
                    startExistingResourceConfiguration={startExistingResourceConfiguration}
                    setStoryIsSaved={setStoryIsSaved}
                    setErrorMessage={setErrorMessage}

                    setEditorBlocked={setEditorBlocked}
                    setEditorFocus={setEditorFocus} />


                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem className="editor-footer">
                <Column
                  style={{paddingTop: 0}}
                  isSize={editorWidth}
                  isOffset={editorX}>
                  <Column style={{paddingTop: 0}}>
                    <StretchedLayoutContainer isDirection="horizontal">
                      <StretchedLayoutItem isFlex={1}>
                        <a onClick={() => setShortcutsHelpVisible(true)}>{t('shortcuts help')}</a>
                      </StretchedLayoutItem>
                      <StretchedLayoutItem style={{textAlign: 'right'}}>
                        <i>{storyIsSaved ? translate('All changes saved') : translate('Saving...')}</i>
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
