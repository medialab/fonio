/**
 * This module provides a form for creating a new story
 * @module fonio/features/HomeView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  Column,
  Columns,
  Container,
  Delete,
  DropZone,
  Help,
  Tab,
  TabLink,
  TabList,
  Tabs,
  Title,
} from 'quinoa-design-library/components';

/**
 * Imports Components
 */
import MetadataForm from '../../../components/MetadataForm';

const NewStoryForm = ( {
  createStoryStatus,
  importStoryStatus,
  mode,
  newStory,
  onClose,
  onCloseNewStory,
  onCreateNewStory,
  onDropFiles,
  onSetModeFile,
  onSetModeForm,
  translate,
  widthRatio,
} ) => {
  return (
    <Column isSize={ widthRatio }>
      {
        <Column>
          <Title isSize={ 2 }>
            <Columns>
              <Column isSize={ 11 }>
                {translate( 'New Story' )}
              </Column>
              <Column style={ { textAlign: 'right' } }>
                <Delete onClick={ onClose } />
              </Column>
            </Columns>
          </Title>
          <Tabs
            isBoxed
            isFullWidth
          >
            <Container>
              <TabList>
                <Tab
                  onClick={ onSetModeForm }
                  isActive={ mode === 'form' }
                ><TabLink>{translate( 'Create a story' )}</TabLink>
                </Tab>
                <Tab
                  onClick={ onSetModeFile }
                  isActive={ mode === 'file' }
                ><TabLink>{translate( 'Import an existing story' )}</TabLink>
                </Tab>
              </TabList>
            </Container>
          </Tabs>
          {mode === 'form' ?
            <MetadataForm
              story={ newStory }
              status={ createStoryStatus }
              onSubmit={ onCreateNewStory }
              onCancel={ onCloseNewStory }
            />
                :
            <Column>
              <DropZone
                accept={ 'application/json' }
                onDrop={ onDropFiles }
              >
                {translate( 'Drop a fonio file' )}
              </DropZone>
              {importStoryStatus === 'fail' && <Help isColor={ 'danger' }>{translate( 'Story is not valid' )}</Help>}

            </Column>
            }
        </Column>
        }

    </Column>
  );
};

export default NewStoryForm;
