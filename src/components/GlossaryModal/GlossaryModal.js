/**
 * This module provides a modal for adding quickly a link in editor
 * @module fonio/components/GlossaryModal
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
  Button,
  Title,
  Field,
  Label,
  Control,
  Image,
  Dropdown,
  FlexContainer,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { abbrevString } from '../../helpers/misc';

class GlossaryModal extends Component {

  static contextTypes = {
    t: PropTypes.func,
  };
  constructor( props ) {
    super( props );
    this.state = {
      dropdownOpen: false,
      choosenResource: undefined,
      name: '',
      description: ''
    };
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( !nextProps.isActive ) {
      this.setState( {
        dropdownOpen: false,
        choosenResource: undefined,
        name: '',
        description: ''
      } );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        onClose,
        glossaryEntries = [],
        isActive,
        onCreateGlossary,
        onContextualizeGlossary,
        focusData
      },
      state: {
        dropdownOpen,
        choosenResource,
        name,
        description
      },
      context: {
        t
      }
    } = this;

    /**
     * Computed variables
     */
    const activeResource = choosenResource && glossaryEntries.find( ( r ) => r.id === choosenResource );

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.GlossaryModal' );

    /**
     * Callbacks handlers
     */
    const handleConfirm = () => {
      if ( name && name.length ) {
        onCreateGlossary( { name, description }, focusData.focusId, focusData.selection );
      }
      else if ( choosenResource ) {
        onContextualizeGlossary( choosenResource, focusData.focusId, focusData.selection );
      }
    };
    const handleSubmit = ( e ) => {
      e.stopPropagation();
      e.preventDefault();
      handleConfirm();
    };
    const handleToggleExistingEntriesDropDown = () => this.setState( { dropdownOpen: !dropdownOpen } );
    const handleChooseResource = ( thatId ) => this.setState( { choosenResource: choosenResource === thatId ? undefined : thatId } );
    const handleNewNameChange = ( e ) => this.setState( { name: e.target.value } );
    const handleNewDescriptionChange = ( e ) => this.setState( { description: e.target.value } );

    return (
      <ModalCard
        isActive={ isActive }
        headerContent={ translate( 'Add a glossary entry' ) }
        onClose={ onClose }
        mainContent={
          <form onSubmit={ handleSubmit }>
            {glossaryEntries.length > 0 &&
            <Field
              style={ {
                        pointerEvents: ( name && name.length ) ? 'none' : 'all',
                        opacity: ( name && name.length ) ? 0.5 : 1
                      } }
            >
              <Title isSize={ 4 }>
                {translate( 'Pick an existing glossary entry from your library' )}
              </Title>
              <Control>
                <Dropdown
                  onToggle={ handleToggleExistingEntriesDropDown }
                  isActive={ dropdownOpen }
                  closeOnChange
                  onChange={ handleChooseResource }
                  value={ { id: choosenResource } }
                  options={ glossaryEntries
                              .sort( ( a, b ) => {
                                if ( a.data.name > b.data.name ) {
                                  return 1;
                                }
                                return -1;
                              } )
                              .map( ( resource ) => ( {
                              id: resource.id,
                              label: (
                                <FlexContainer
                                  alignItems={ 'center' }
                                  flexDirection={ 'row' }
                                >
                                  <Image
                                    style={ { display: 'inline-block', marginRight: '1em' } }
                                    isSize={ '16x16' }
                                    src={ icons.glossary.black.svg }
                                  />
                                  <span >
                                    {`${abbrevString( resource.data.name, 30 )}`}
                                  </span>
                                </FlexContainer>
                                )
                            } ) ) }
                >
                  {choosenResource && activeResource ? abbrevString( `${activeResource.data.name}`, 60 ) : translate( 'Choose an existing glossary entry' )}
                </Dropdown>
              </Control>
            </Field>
              }
            <div>
              <Title isSize={ 4 }>
                {translate( 'Create a new glossary entry' )}
              </Title>
              <Field>
                <Label>{translate( 'Name' )}</Label>
                <Control>
                  <input
                    className={ 'input' }
                    placeholder={ translate( 'Name' ) }
                    value={ name }
                    onChange={ handleNewNameChange }
                  />
                </Control>
              </Field>
              <Field>
                <Label>{translate( 'Description of the entry' )}</Label>
                <Control>
                  <textarea
                    className={ 'textarea' }
                    placeholder={ translate( 'Entry description' ) }
                    value={ description }
                    onChange={ handleNewDescriptionChange }
                  />
                </Control>
              </Field>
            </div>
          </form>
        }
        footerContent={ [
          <Button
            type={ 'submit' }
            isFullWidth
            key={ 0 }
            onClick={ handleConfirm }
            isDisabled={ !choosenResource && !( name && name.length ) }
            isColor={ 'primary' }
          >{translate( 'Add entry' )}
          </Button>,
          <Button
            onClick={ onClose }
            isFullWidth
            key={ 1 }
            isColor={ 'warning' }
          >{translate( 'Cancel' )}
          </Button>,
        ] }
      />
    );
  }
}

export default GlossaryModal;
