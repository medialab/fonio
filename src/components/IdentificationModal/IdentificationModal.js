/**
 * This module provides a modal for inputing user personal identification data
 * @module fonio/components/IdentificationModal
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ModalCard,
  Field,
  Label,
  Control,
  Input,
  Button,
  Columns,
  Column,
  Dropdown,
  Image
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { silentEvent } from '../../helpers/misc';

/**
 * Import assets
 */
import avatars from '../../sharedAssets/avatars';

class IdentificationModal extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      dropdownOpen: false
    };
  }

  toggleDropdown = () => {
    this.setState( {
      dropdownOpen: !this.state.dropdownOpen
    } );
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        isActive,

        userInfo,

        onChange,
        onClose,
        onSubmit
      },
      state: {
        dropdownOpen
      },
      context: {
        t
      },
      toggleDropdown,
    } = this;

    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.IdentificationModal' );

    /**
     * Callbacks handlers
     */
    const handleNameChange = ( e ) => onChange( {
      ...userInfo,
      name: e.target.value
    } );

    const handleAvatarChange = ( fileName ) => onChange( {
      ...userInfo,
      avatar: fileName
    } );

    const handleSubmit = ( e ) => {
      silentEvent( e );
      onSubmit();
    };

    const avatarsList = avatars
    .map( ( fileName ) => ( {
      id: fileName,
      label: (
        <Image
          isRounded
          isSize={ '32x32' }
          src={ require( `../../sharedAssets/avatars/${fileName}` ) }
        />
      )
    } ) );

    return userInfo.userId ? (
      <ModalCard
        isActive={ isActive }
        onClose={ onClose }
        headerContent={ translate( 'Who is this?' ) }
        mainContent={
          <form onSubmit={ handleSubmit }>
            <Columns>
              <Column isSize={ 2 }>
                <Dropdown
                  value={ {
                        id: userInfo.avatar
                      } }
                  onToggle={ toggleDropdown }
                  onChange={ handleAvatarChange }
                  isActive={ dropdownOpen }
                  options={ avatarsList }
                >
                  <Image
                    isRounded
                    isSize={ '32x32' }
                    src={ require( `../../sharedAssets/avatars/${userInfo.avatar}` ) }
                  />
                </Dropdown>
              </Column>
              <Column isSize={ 10 }>
                <Field>
                  <Label>{translate( 'Enter a nickname' )}</Label>
                  <Control>
                    <Input
                      onChange={ handleNameChange }
                      value={ userInfo.name }
                      type={ 'text' }
                      placeholder={ 'Enter a nickname' }
                    />
                  </Control>
                </Field>
              </Column>
            </Columns>
          </form>
        }
        footerContent={ [
          <Button
            isFullWidth
            key={ 0 }
            onClick={ onSubmit }
            isColor={ 'success' }
          >{translate( 'Submit new information' )}
          </Button>,
          <Button
            isFullWidth
            onClick={ onClose }
            key={ 1 }
            isColor={ 'warning' }
          >{translate( 'Cancel' )}
          </Button>
            ] }
      />
    ) : null;

  }
}

IdentificationModal.propTypes = {
  isActive: PropTypes.bool,

  onChange: PropTypes.func,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  userInfo: PropTypes.shape( {
    name: PropTypes.string,
    avatar: PropTypes.string
  } ),
};

IdentificationModal.contextTypes = {
  t: PropTypes.func.isRequired,
};

export default IdentificationModal;
