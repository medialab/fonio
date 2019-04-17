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
  HelpPin,
  Image,
  Label,
  Level,
  Select,
  Title,
} from 'quinoa-design-library/components/';
import { getStyles } from 'quinoa-schemas';
import defaults from 'json-schema-defaults';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import StyleEditor from './StyleEditor';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { abbrevString } from '../../../helpers/misc';

const AsideDesignContents = ( {
  designAsideTabCollapsed,
  designAsideTabMode,
  setReferenceTypesVisible,
  template,
  story,
  setCssHelpVisible,
  setCoverImageChoiceVisible,
  coverImageChoiceVisible,
  options,
  resourceTypes,
  referenceTypesVisible,
  onUpdateTemplatesVariables,
  getTooltipContainer,
  onTemplateChange,
  onSetCoverImage,
  templates,
}, { t, getResourceDataUrl } ) => {

  const { acceptsOptions = [], stylesVariables } = template;
  const styles = getStyles( story );
  const coverImageId = ( story.metadata.coverImage && story.metadata.coverImage.resourceId && story.resources[story.metadata.coverImage.resourceId] && story.metadata.coverImage.resourceId ) || 'none';
  const availableCoverImages = Object.keys( story.resources ).filter( ( resourceId ) => story.resources[resourceId].metadata.type === 'image' ).map( ( resourceId ) => story.resources[resourceId] );

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.DesignView' );

  /**
   * Callbacks handlers
   */
  const handleTemplateChange = ( e ) => {
    onTemplateChange( e.target.value );
  };
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

  const handleCoverImageChange = ( id ) => {
    if ( id === 'none' ) {
      onSetCoverImage( undefined );
    }
 else onSetCoverImage( id );
    setCoverImageChoiceVisible( false );
  };

  const handleToggleReferenceTypesVisibility = () => setReferenceTypesVisible( !referenceTypesVisible );
  const handleToggleCoverImageChoiceVisible = () => setCoverImageChoiceVisible( !coverImageChoiceVisible );
  const handleShowCssHelp = () => setCssHelpVisible( true );

  if ( designAsideTabCollapsed ) {
      return null;
    }
    switch ( designAsideTabMode ) {
      case 'settings':
        return (
          <Column>
            {
              templates.length > 1 &&
              <Level>
                <form>
                  <Field>
                    <Label>{translate( 'Story template' )}<HelpPin>{translate( 'template choice explanation' )}</HelpPin></Label>
                    <Control>
                      <Select
                        onChange={ handleTemplateChange }
                        value={ template.id }
                      >
                        {
                          templates.map( ( temp ) => (
                            <option
                              key={ temp.id }
                              value={ temp.id }
                            >
                              {temp.name}
                            </option>
                          ) )
                        }
                      </Select>
                    </Control>
                  </Field>
                </form>
              </Level>
            }
            <Level>
              <form>
                <Field>
                  <Label>{translate( 'Cover image' )}<HelpPin>{translate( 'cover image choice explanation' )}</HelpPin></Label>
                  <Control>
                    <Dropdown
                      onToggle={ handleToggleCoverImageChoiceVisible }
                      isActive={ coverImageChoiceVisible }
                      closeOnChange={ false }
                      onChange={ handleCoverImageChange }
                      value={ coverImageId }
                      options={
                          [
                            {
                              id: 'none',
                              label: (
                                <span style={ { display: 'flex', flexFlow: 'row nowrap', alignItems: 'center', minHeight: '32px' } }>
                                  <span
                                    style={ { display: 'inline-block', marginRight: '1em', minWidth: '32px', minHeight: '20px', background: 'lightgrey' } }
                                  />
                                  {translate( 'No cover image' )}
                                </span>
                              )
                            },
                            ...availableCoverImages.map( ( image ) => ( {
                              id: image.id,
                              label: (
                                <span style={ { display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' } }>
                                  <Image
                                    style={ { display: 'inline-block', marginRight: '1em' } }
                                    isSize={ '32x32' }
                                    src={ getResourceDataUrl( image.data ) }
                                  />
                                  <span title={ image.metadata.title }>
                                    {abbrevString( image.metadata.title, 20 )}
                                  </span>
                                </span>
                              )
                            } ) )

                          ]

                            }
                    >
                      {coverImageId !== 'none' ?
                        <span style={ { display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' } }>
                          <Image
                            style={ { display: 'inline-block', marginRight: '1em' } }
                            isSize={ '16x16' }
                            src={ getResourceDataUrl( story.resources[coverImageId].data ) }
                          />
                          <span>
                            {abbrevString( story.resources[coverImageId].metadata.title, 20 ) }
                          </span>
                        </span>
                        :
                        translate( 'No cover image' )

                      }

                    </Dropdown>
                  </Control>
                </Field>
              </form>
            </Level>

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
        const variables = Object.keys( styles.stylesVariables ).length ? styles.stylesVariables : defaults( stylesVariables );
        const handleResetStyles = () => {
          const defaultStyles = defaults( stylesVariables );
          onUpdateStylesVariables( defaultStyles );
        };
        return (
          <Column>
            {stylesVariables && story.settings.styles &&
              <StyleEditor
                getTooltipContainer={ getTooltipContainer }
                options={ stylesVariables }
                onChange={ onUpdateStylesVariables }
                styles={ variables }
              />
            }
            <Level>
              <Button
                onClick={ handleResetStyles }
                isFullWidth
              >{translate( 'reset styles to template defaults' )}
              </Button>
            </Level>
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
  getResourceDataUrl: PropTypes.func,
};

export default AsideDesignContents;
