import React from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';

import SectionEditor from '../../../components/SectionEditor';
import NewSectionForm from '../../../components/NewSectionForm';
import ResourceForm from '../../../components/ResourceForm';


import {translateNameSpacer} from '../../../helpers/translateUtils';

import {
  Button,
  Column,
  Columns,
  Delete,
  DropZone,
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import {
  abbrevString
} from '../../../helpers/misc';


const MainSectionColumn = ({
  userLockedResourceId,
  mainColumnMode,
  defaultSectionMetadata,
  story,
  section,
  userId,

  editorStates,
  editorFocus,
  assetRequestState,

  newResourceType,

  updateSection,

  setMainColumnMode,
  onNewSectionSubmit,


  promptAssetEmbed,
  unpromptAssetEmbed,
  setEditorFocus,

  createContextualization,
  createContextualizer,
  createResource,

  leaveBlock,

  updateDraftEditorState,
  updateDraftEditorsStates,

  updateContextualizer,
  updateResource,
  deleteContextualization,
  deleteContextualizer,
  deleteContextualizationFromId,

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

  const onUpdateSection = newSection => {
    updateSection(newSection);
  };

  const onUpdateMetadata = metadata => {
    onUpdateSection({
      ...section,
      metadata: {
        ...section.metadata,
        ...metadata
      }
    });
    setMainColumnMode('edit');
  };


  const renderMain = () => {
    if (userLockedResourceId) {
      const handleSubmit = resource => {
        const {id: resourceId} = resource;
        updateResource({
          resourceId,
          resource,
          storyId,
          userId
        });
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
        <Column style={{position: 'relative', height: '100%', width: '100%'}}>
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

            createResource({
              resourceId,
              resource: {
                ...resource,
                id: resourceId
              },
              storyId,
              userId
            });
            setMainColumnMode('edition');
          };
          return (
            <Column isWrapper>
              <StretchedLayoutContainer isAbsolute>
                <StretchedLayoutItem isFlex={1}>
                  <Column isWrapper>
                    <ResourceForm
                      resourceType={newResourceType}
                      onCancel={() => setMainColumnMode('edition')}
                      onSubmit={handleSubmit}
                      asNewResource />
                  </Column>
                </StretchedLayoutItem>
                <StretchedLayoutItem>
                  <Column>
                    <DropZone onDrop={submitMultiResources}>
                      {translate('Drop files here to include new items in your library (images, tables, bibliographies)')}
                    </DropZone>
                  </Column>
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </Column>
          );
      case 'newsection':
        return (
          <Column isWrapper>
            <StretchedLayoutContainer isAbsolute>
              <StretchedLayoutItem>
                <Column>
                  <Title isSize={2}>
                    <Columns>
                      <Column isSize={10}>
                        {translate('New section')}
                      </Column>
                      <Column isSize={2}>
                        <Delete onClick={() => setMainColumnMode('edition')} />
                      </Column>
                    </Columns>
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
        return (<Column isWrapper>
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem>
              <Column>
                <Title isSize={2}>
                  <Columns>
                    <Column isSize={10}>
                      {translate('Edit section metadata')}
                    </Column>
                    <Column isSize={2}>
                      <Delete onClick={() => setMainColumnMode('edition')} />
                    </Column>
                  </Columns>
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

  return (
    <Column isSize={'fullwidth'} isWrapper>
      <StretchedLayoutContainer isFluid isAbsolute isDirection="horizontal">
        
        <StretchedLayoutItem isFlex={mainColumnMode === 'edition' && !userLockedResourceId ? 0 : 6}>
          {renderMain()}
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={mainColumnMode === 'edition' && !userLockedResourceId ? 12 : 6}>
          <Column
            isWrapper isSize={{
                mobile: mainColumnMode === 'edition' ? 10 : 12,
                tablet: mainColumnMode === 'edition' ? 8 : 12,
                widescreen: mainColumnMode === 'edition' ? 6 : 12
              }}
            isOffset={{
                mobile: mainColumnMode === 'edition' ? 1 : 0,
                tablet: mainColumnMode === 'edition' ? 2 : 0,
                widescreen: mainColumnMode === 'edition' ? 3 : 0
              }}>
            <StretchedLayoutContainer isAbsolute isDirection="vertical">
              <StretchedLayoutItem>
                <Column isWrapper>
                  {/* editor header*/}
                  <StretchedLayoutContainer isFluid isDirection={mainColumnMode !== 'edition' ? 'vertical' : 'horizontal'}>
                    <StretchedLayoutItem isFlex={1}>
                      <Title isSize={2}>
                        {abbrevString(section.metadata.title, 20)}
                      </Title>
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Button
                        isColor={mainColumnMode === 'editmetadata' ? 'primary' : ''}
                        onClick={onEditMetadataClick}>
                        {translate('Edit section metadata')}
                      </Button>
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
              </StretchedLayoutItem>
              {/*editor*/}
              <StretchedLayoutItem isFlex={1}>
                <Column isWrapper>
                  <SectionEditor
                    style={{height: '100%'}}
                    story={story}
                    activeSection={section}
                    sectionId={section.id}
                    editorStates={editorStates}
                    updateDraftEditorState={updateDraftEditorState}
                    updateDraftEditorsStates={updateDraftEditorsStates}
                    editorFocus={editorFocus}
                    userId={userId}

                    updateSection={newSection => onUpdateSection(newSection)}

                    summonAsset={summonAsset}

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

                    setEditorFocus={setEditorFocus} />
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </Column>


          {/*<Level>
                <Control>
                  <Label>
                    {translate('Section content')}
                    <HelpPin place="right">
                      {translate('Explanation about the section content')}
                    </HelpPin>
                  </Label>
                </Control>
              </Level>*/}
          {/*<Level />*/}

        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

MainSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default MainSectionColumn;
