/**
 * This module provides a layout component for displaying design view aside column contents
 * @module fonio/features/DesignView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  CodeEditor,
  Column,
  Collapsable,
  Control,
  Dropdown,
  Field,
  Image,
  Label,
  Level,
  Select,
  Title,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

const AsideDesignContents = ( {
  designAsideTabCollapsed,
  designAsideTabMode,
  handleOptionChange,
  setReferenceTypesVisible,
  templateOptions,
  onUpdateCss,
  story,
  stylesMode,
  setCssHelpVisible,
  options,
  resourceTypes,
  handleUpdateReferenceTypes,
  referenceTypesVisible,
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.DesignView' );

  /**
   * Callbacks handlers
   */
  const handleNotesPositionChange = ( e ) => handleOptionChange( 'notesPosition', e.target.value );
  const handleToggleReferenceTypesVisibility = () => setReferenceTypesVisible( !referenceTypesVisible );
  const handleReferenceStatusChange = ( e ) => handleOptionChange( 'referenceStatus', e.target.value );
  const handleShowCssHelp = () => setCssHelpVisible( true );

  if ( designAsideTabCollapsed ) {
      return null;
    }
    switch ( designAsideTabMode ) {
      case 'settings':
        return (
          <Column>
            {
              templateOptions.indexOf( 'notesPosition' ) > -1 &&
              <Level>
                <form>
                  <Field>
                    <Label>{translate( 'Notes position' )}</Label>
                    <Control>
                      <Select
                        onChange={ handleNotesPositionChange }
                        value={ options.notesPosition }
                      >
                        <option value={ 'aside' } >{translate( 'side notes' )}</option>
                        <option value={ 'foot' }>{translate( 'foot notes' )}</option>
                      </Select>
                    </Control>
                  </Field>
                </form>
              </Level>
            }
            {
              templateOptions.indexOf( 'referenceTypes' ) > -1 &&
              <Level>
                <form>
                  <Field>
                    <Label>{translate( 'What types of items to show in references' )}</Label>
                    <Control>
                      <Dropdown
                        onToggle={ handleToggleReferenceTypesVisibility }
                        isActive={ referenceTypesVisible }
                        closeOnChange={ false }
                        onChange={ handleUpdateReferenceTypes }
                        value={ ( story.settings.options && story.settings.options.referenceTypes ) || [ 'bib' ] }
                        options={ resourceTypes.map( ( type ) => ( {
                                id: type,
                                label: (
                                  <span style={ { display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' } }>
                                    <Image
                                      style={ { display: 'inline-block', marginRight: '1em' } }
                                      isSize={ '16x16' }
                                      src={ icons[type].black.svg }
                                    />
                                    <span>
                                      {translate( type )}
                                    </span>
                                  </span>
                                )
                              } ) ) }
                      >
                        {translate( 'Choose item types' )}
                      </Dropdown>
                    </Control>
                  </Field>
                </form>
              </Level>
            }
            {
              templateOptions.indexOf( 'referenceStatus' ) > -1 &&
              <Level>
                <form>
                  <Field>
                    <Label>{translate( 'What items to show in references' )}</Label>
                    <Control>
                      <Select
                        onChange={ handleReferenceStatusChange }
                        value={ options.referenceStatus }
                      >
                        <option value={ 'cited' }>{translate( 'cited items only' )}</option>
                        <option value={ 'all' }>{translate( 'all items' )}</option>
                      </Select>
                    </Control>
                  </Field>
                </form>
              </Level>
            }
          </Column>
        );
      case 'styles':
      default:
        return (
          <Column>
            <Title isSize={ 3 }>
              {translate( 'Edit style with css' )}
            </Title>
            {stylesMode === 'code' && <Level />}
            {/* @todo put here other style modes ui */}
            <Collapsable isCollapsed={ stylesMode !== 'code' }>
              <Column>
                <CodeEditor
                  value={ story.settings.css }
                  onChange={ onUpdateCss }
                />
              </Column>
              <Column>
                <Button
                  isFullWidth
                  onClick={ handleShowCssHelp }
                >
                  {translate( 'Help' )}
                </Button>
              </Column>
            </Collapsable>
          </Column>
        );
    }
};

AsideDesignContents.contextTypes = {
  t: PropTypes.func,
};

export default AsideDesignContents;
