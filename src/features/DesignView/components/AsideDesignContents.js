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
  Control,
  Dropdown,
  Field,
  Image,
  Label,
  Level,
  Select,
  Title,
} from 'quinoa-design-library/components/';
import { getStyles } from 'quinoa-schemas';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import StyleEditor from './StyleEditor';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

const AsideDesignContents = ( {
  designAsideTabCollapsed,
  designAsideTabMode,
  setReferenceTypesVisible,
  template,
  story,
  setCssHelpVisible,
  options,
  resourceTypes,
  referenceTypesVisible,
  onUpdateTemplatesVariables
}, { t } ) => {

  const { acceptsOptions = [], stylesVariables } = template;
  const styles = getStyles( story );

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.DesignView' );

  /**
   * Callbacks handlers
   */
  const handleNotesPositionChange = ( e ) => onUpdateTemplatesVariables(
    [ 'options', 'notesPosition' ],
    e.target.value
  );
  const handleReferenceStatusChange = ( e ) => onUpdateTemplatesVariables(
    [ 'options', 'referenceStatus' ],
    e.target.value
  );
  const onUpdateStylesVariables = ( style ) => onUpdateTemplatesVariables(
    [ 'stylesVariables' ],
    style
  );
  const onUpdateCss = ( css ) => onUpdateTemplatesVariables(
    [ 'css' ],
    css
  );
  const handleUpdateReferenceTypes = ( type ) => {
    onUpdateTemplatesVariables(
      [ 'options', 'referenceTypes' ],
      options.referenceTypes.includes( type )
        ? options.referenceTypes.filter( ( thatType ) => thatType !== type )
        : [ ...options.referenceTypes, type ] );
  };

  const handleToggleReferenceTypesVisibility = () => setReferenceTypesVisible( !referenceTypesVisible );
  const handleShowCssHelp = () => setCssHelpVisible( true );

  if ( designAsideTabCollapsed ) {
      return null;
    }
    switch ( designAsideTabMode ) {
      case 'settings':
        return (
          <Column>
            {
              acceptsOptions.includes( 'notesPosition' ) &&
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
              acceptsOptions.includes( 'referenceTypes' ) &&
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
                        value={ ( options && options.referenceTypes ) || [ { id: 'bib', label: 'bib' } ] }
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
              acceptsOptions.includes( 'referenceStatus' ) &&
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
            {stylesVariables && story.settings.styles &&
              <Column>
                <StyleEditor
                  options={ stylesVariables }
                  onChange={ onUpdateStylesVariables }
                  styles={ styles.stylesVariables }
                />
              </Column>
            }
            <Title isSize={ 3 }>
              {translate( 'Edit style with css' )}
            </Title>
            <Column>
              <CodeEditor
                value={ styles.css }
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
          </Column>
        );
    }
};

AsideDesignContents.contextTypes = {
  t: PropTypes.func,
};

export default AsideDesignContents;
