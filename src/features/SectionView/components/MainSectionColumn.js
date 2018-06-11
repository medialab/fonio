import React from 'react';
import PropTypes from 'prop-types';

// import {translateNameSpacer} from '../../../helpers/translateUtils';
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
  setMainColumnMode,
  story,
  section,

  updateSection,
}, {
  // t
}) => {

  const {id: storyId} = story;
  const {id: sectionId} = section;
  // const translate = translateNameSpacer(t, 'Features.SectionView');

  const onUpdateSection = newSection => {
    updateSection({
      storyId,
      sectionId,
      section: newSection
    });
  };

  const onUpdateTitle = e => {
    const title = e.target.value;
    onUpdateSection({
      ...section,
      metadata: {
        ...section.metadata,
        title
      }
    });
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
      case 'edit':
      default:
        return (
          <div>
            <input onChange={onUpdateTitle} value={section.metadata.title} />
            Editor here
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
