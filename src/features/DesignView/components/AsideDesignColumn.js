/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { templates } from 'quinoa-story-player';
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
  Tab,
  TabLink,
  TabList,
  Title,
  Tabs,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
/**
 * Imports Assets
 */
import resourceSchema from 'quinoa-schemas/resource';

/**
 * Shared variables
 */
const resourceTypes = Object.keys( resourceSchema.definitions ).filter( ( t ) => t !== 'glossary' );

const AsideDesignColumn = ( {
  designAsideTabCollapsed,
  designAsideTabMode,
  stylesMode = 'code',
  story = {},
  style = {},

  setDesignAsideTabCollapsed,
  setDesignAsideTabMode,

  onUpdateCss,
  onUpdateSettings,

  referenceTypesVisible,
  setReferenceTypesVisible,

  setCssHelpVisible,

}, { t } ) => {

  /**
   * Variables definition
   */
  const { settings = {} } = story;
  const { options = {} } = settings;
  const template = templates.find( ( thatTemplate ) => thatTemplate.id === story.settings.template );
  const templateOptions = template.acceptsOptions || [];

  /**
   * Computed variables
   */
  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.DesignView' );

  /**
   * Callbacks handlers
   */
  const handleOptionChange = ( key, value ) => {
    onUpdateSettings( {
      ...settings,
      options: {
        ...settings.options,
        [key]: value
      }
    } );
  };
  const handleUpdateReferenceTypes = ( type ) => {
    const referenceTypes = options.referenceTypes || [];
    let newReferenceTypes;
    if ( referenceTypes.indexOf( type ) === -1 ) {
      newReferenceTypes = [ ...referenceTypes, type ];
    }
    else {
      newReferenceTypes = referenceTypes.filter( ( thatType ) => thatType !== type );
    }
    handleOptionChange( 'referenceTypes', newReferenceTypes );
  };

  const handleSetAsideAsSettings = () => setDesignAsideTabMode( 'settings' );
  const handleSetAsideAsStyles = () => setDesignAsideTabMode( 'styles' );
  const handleToggleAsideCollapsed = () => setDesignAsideTabCollapsed( !designAsideTabCollapsed );

  /**
   * @todo externalize this
   */
  const renderAsideContent = () => {
    if ( designAsideTabCollapsed ) {
      return null;
    }
    switch ( designAsideTabMode ) {
      case 'settings':
        const handleNotesPositionChange = ( e ) => handleOptionChange( 'notesPosition', e.target.value );
        const handleToggleReferenceTypesVisibility = () => setReferenceTypesVisible( !referenceTypesVisible );
        const handleReferenceStatusChange = ( e ) => handleOptionChange( 'referenceStatus', e.target.value );

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
        const handleShowCssHelp = () => setCssHelpVisible( true );
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

  return (
    <Column
      style={ style }
      className={ 'is-hidden-mobile aside-design-container' }
      isSize={ designAsideTabCollapsed ? 1 : '1/4' }
      isWrapper
    >
      <StretchedLayoutContainer
        isDirection={ 'vertical' }
        isAbsolute
      >
        <StretchedLayoutItem>
          <Column>
            <Tabs
              isBoxed
              isFullWidth
              style={ { overflow: 'hidden' } }
            >
              <TabList>
                {
                  !designAsideTabCollapsed &&
                  <Tab
                    onClick={ handleSetAsideAsSettings }
                    isActive={ designAsideTabMode === 'settings' }
                  >
                    <TabLink>{translate( 'Settings' )}</TabLink>
                  </Tab>
                }
                {
                  !designAsideTabCollapsed &&
                  'collapse' &&
                  <Tab
                    onClick={ handleSetAsideAsStyles }
                    isActive={ designAsideTabMode === 'styles' }
                  >
                    <TabLink>
                      {translate( 'Styles' )}
                    </TabLink>
                  </Tab>
                }
                <Tab
                  className={ 'is-hidden-mobile' }
                  onClick={ handleToggleAsideCollapsed }
                  isActive={ designAsideTabCollapsed }
                >
                  <TabLink
                    style={ {
                          boxShadow: 'none',
                          transform: designAsideTabCollapsed ? 'rotate(180deg)' : undefined,
                          transition: 'all .5s ease'
                        } }
                    data-for={ 'tooltip' }
                    data-effect={ 'solid' }
                    data-place={ 'right' }
                    data-tip={ designAsideTabCollapsed ? translate( 'show settings pannels' ) : translate( 'hide settings pannels' ) }
                  >
                      ◀
                  </TabLink>
                </Tab>
              </TabList>
            </Tabs>
          </Column>
        </StretchedLayoutItem>
        <StretchedLayoutItem
          isFlex={ 1 }
          isFlowing
        >
          {renderAsideContent()}
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

AsideDesignColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideDesignColumn;
