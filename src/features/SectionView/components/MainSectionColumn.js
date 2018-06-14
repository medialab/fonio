import React from 'react';
import PropTypes from 'prop-types';

import SectionEditor from '../../../components/SectionEditor';
import NewSectionForm from '../../../components/NewSectionForm';

import TitleForm from './TitleForm';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const resourceTypes = ['bib', 'image', 'video', 'embed', 'webpage', 'table', 'glossary'];

import {
  BigSelect,
  Column,
  Columns,
  Control,
  Label,
  HelpPin,
  Delete,
  Level,
  Title,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import NewResourceForm from './NewResourceForm';

const MainSectionColumn = ({
  mainColumnMode,
  defaultSectionMetadata,
  story,
  section,

  editorStates,
  editorFocus,
  assetRequestState,

  updateSection,

  setMainColumnMode,
  onNewSectionSubmit,


  promptAssetEmbed,
  unpromptAssetEmbed,
  setEditorFocus,

  createContextualization,
  createContextualizer,
  createResource,

  updateDraftEditorState,
  updateDraftEditorsStates,

  updateContextualizer,
  updateResource,
  deleteContextualization,
  deleteContextualizer,

  setAssetRequestContentId,
  startNewResourceConfiguration,
  startExistingResourceConfiguration,

  summonAsset,
}, {
  t
}) => {


  // const {id: storyId} = story;
  // const {id: sectionId} = section;
  const translate = translateNameSpacer(t, 'Features.SectionView');

  const onUpdateSection = newSection => {
    updateSection(newSection);
  };

  const onUpdateTitle = title => {
    // const title = e.target.value;
    onUpdateSection({
      ...section,
      metadata: {
        ...section.metadata,
        title
      }
    });
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

    switch (mainColumnMode) {
      case 'newresource':
        return (
          <div>
            <Level />
            <Title isSize={2}>
              <Columns>
                <Column isSize={11}>
                  Create a new resource
                </Column>
                <Column>
                  <Delete onClick={
                    () => setMainColumnMode('list')
                  } />
                </Column>
              </Columns>
            </Title>
            <BigSelect
              activeOptionId={'image'}
              options={
                resourceTypes.map(type => ({
                  id: type,
                  label: type,
                  iconUrl: icons[type].black.svg
                }))
              } />
            <NewResourceForm />
          </div>
        );
      case 'editresource':
        return (
          <div>
            <Level />
            <Title isSize={2}>
              <Columns>
                <Column isSize={11}>
                  Edit video
                </Column>
                <Column>
                  <Delete onClick={
                    () => setMainColumnMode('list')
                  } />
                </Column>
              </Columns>
            </Title>
            <NewResourceForm />
          </div>
        );
      case 'newsection':
        return (
          <Column>
            <Title isSize={2}>
              <Columns>
                <Column isSize={10}>
                  {translate('New section')}
                </Column>
                <Column isSize={2}>
                  <Delete onClick={() => setMainColumnMode('edit')} />
                </Column>
              </Columns>
            </Title>
            <Level>
              <NewSectionForm
                metadata={{...defaultSectionMetadata}}
                onSubmit={onNewSectionSubmit}
                onCancel={() => setMainColumnMode('main')} />
            </Level>
          </Column>
        );
      case 'editmetadata':
        return (
          <Column>
            <Title isSize={2}>
              <Columns>
                <Column isSize={10}>
                  {translate('Edit section metadata')}
                </Column>
                <Column isSize={2}>
                  <Delete onClick={() => setMainColumnMode('edit')} />
                </Column>
              </Columns>
            </Title>
            <Level>
              <NewSectionForm
                submitMessage={translate('Save changes')}
                metadata={{...section.metadata}}
                onSubmit={onUpdateMetadata}
                onCancel={() => setMainColumnMode('main')} />
            </Level>
          </Column>
        );
      case 'edit':
      default:
        return (
          <div style={{display: 'flex', flexFlow: 'column nowrap', height: '100%', justifyContent: 'stretch'}}>
            <div style={{padding: '0 10rem 0 10rem'}}>
              <Level>
                <TitleForm
                  onSubmit={onUpdateTitle}
                  title={section.metadata.title} 
                />
              </Level>
              <Level>
                <Control>
                  <Label>
                    {translate('Section content')}
                    <HelpPin place="right">
                      {translate('Explanation about the section title')}
                    </HelpPin>
                  </Label>
                </Control>
              </Level>
              <Level/>
            </div>
            <SectionEditor
              style={{flex: 1}}
              story={story}
              activeSection={section}
              sectionId={section.id}
              editorStates={editorStates}
              updateDraftEditorState={updateDraftEditorState}
              updateDraftEditorsStates={updateDraftEditorsStates}
              editorFocus={editorFocus}

              updateSection={newSection => onUpdateSection(newSection)}

              summonAsset={summonAsset}

              createContextualization={createContextualization}
              createContextualizer={createContextualizer}
              createResource={createResource}

              updateContextualizer={updateContextualizer}
              updateResource={updateResource}

              deleteContextualization={deleteContextualization}
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
          </div>
        );
    }
  };

  return (
    <Column isSize={'fullwidth'}>
      {renderMain()}
    </Column>
  );
};

MainSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default MainSectionColumn;
