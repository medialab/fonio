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

  templateChoiceVisible,
  referenceStatusChoiceVisible,
  notesPositionChoiceVisible,
  setTemplateChoiceVisible,
  setReferenceStatusChoiceVisible,
  setNotesPositionChoiceVisible,
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
  const handleTemplateChange = ( id ) => {
    onTemplateChange( id );
  };
  const handleNotesPositionChange = ( val ) => onUpdateTemplatesVariables(
    [ 'options', 'notesPosition' ],
    val
  );
  const handleReferenceStatusChange = ( val ) => onUpdateTemplatesVariables(
    [ 'options', 'referenceStatus' ],
    val
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
              <div>
                <form>
                  <Field>
                    <Label>{translate( 'Story template' )}<HelpPin>{translate( 'template choice explanation' )}</HelpPin></Label>
                    <Control>
                      <Dropdown
                        onToggle={ () => setTemplateChoiceVisible( !templateChoiceVisible ) }
                        isActive={ templateChoiceVisible }
                        closeOnChange
                        onChange={ handleTemplateChange }
                        value={ template.id }
                        options={ templates.map( ( temp ) => ( {
                                id: temp.id,
                                label: (
                                  <span style={ { display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' } }>
                                    <span>
                                      {temp.id}
                                    </span>
                                    <HelpPin>{translate( `${temp.id } template description` )}</HelpPin>
                                  </span>
                                )
                              } ) ) }
                      >
                        {template.id}
                      </Dropdown>
                    </Control>
                  </Field>
                </form>
              </div>
            }
            <div>
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
            </div>

            {
              acceptsOptions.includes( 'notesPosition' ) &&
              <div>
                <form>
                  <Field>
                    <Label>{translate( 'Notes position' )}</Label>
                    <Control>
                      <Dropdown
                        onToggle={ () => setNotesPositionChoiceVisible( !notesPositionChoiceVisible ) }
                        isActive={ notesPositionChoiceVisible }
                        closeOnChange
                        onChange={ handleNotesPositionChange }
                        value={ options.notesPosition }
                        options={ [
                          {
                            id: 'aside',
                            label: translate( 'side notes' )
                          },
                          {
                            id: 'foot',
                            label: translate( 'foot notes' )
                          }

                        ] }
                      >
                        {options.notesPosition === 'aside' ? translate( 'side notes' ) : translate( 'foot notes' )}
                      </Dropdown>
                    </Control>
                  </Field>
                </form>
              </div>
            }
            {
              acceptsOptions.includes( 'referenceTypes' ) &&
              <div>
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
              </div>
            }
            {
              acceptsOptions.includes( 'referenceStatus' ) &&
              <div>
                <form>
                  <Field>
                    <Label>{translate( 'What items to show in references' )}</Label>
                    <Control>
                      <Dropdown
                        onToggle={ () => setReferenceStatusChoiceVisible( !referenceStatusChoiceVisible ) }
                        isActive={ referenceStatusChoiceVisible }
                        closeOnChange
                        onChange={ handleReferenceStatusChange }
                        value={ options.referenceStatus }
                        options={ [
                          {
                            id: 'cited',
                            label: translate( 'cited items only' )
                          },
                          {
                            id: 'foot',
                            label: translate( 'all items' )
                          }

                        ] }
                      >
                        {options.referenceStatus === 'cited' ? translate( 'cited items only' ) : translate( 'all items' )}
                      </Dropdown>
                    </Control>
                  </Field>
                </form>
              </div>
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
