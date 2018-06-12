import React from 'react';
import PropTypes from 'prop-types';

// import SectionEditor from '../../../components/SectionEditor';
import NewSectionForm from '../../../components/NewSectionForm';

import TitleForm from './TitleForm';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const resourceTypes = ['bib', 'image', 'video', 'embed', 'webpage', 'table', 'glossary'];

import {
  BigSelect,
  Column,
  Columns,
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

  updateSection,
  setMainColumnMode,
  onNewSectionSubmit,
}, {
  t
}) => {


  const {id: storyId} = story;
  const {id: sectionId} = section;
  const translate = translateNameSpacer(t, 'Features.SectionView');

  const onUpdateSection = newSection => {
    updateSection({
      storyId,
      sectionId,
      section: newSection
    });
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
          <div>
            <TitleForm
              onSubmit={onUpdateTitle}
              title={section.metadata.title} />
            {/*<SectionEditor
              startExistingResourceConfiguration={e => console.log('start existing resource configuration')}
              startNewResourceConfiguration={e => console.log('start new resource configuration')}
              deleteContextualization={e => console.log('delete contextualization')}
              story={story}
              activeSection={section}
              editorStates={undefined}
              assetRequestPosition={undefined}
              editorFocus={undefined}
              updateSection={() => console.log('update section')}
              setEditorFocus={() => console.log('set editor focus')}
              updateDraftEditorState={() => console.log('update draft editor state')}
              cancelAssetRequest={() => console.log('cancel asset request')}
              summonAsset={() => console.log('summon asset')}
              setAssetRequestContentId={() => console.log('setAssetRequestContentId')}
            /> */}
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
