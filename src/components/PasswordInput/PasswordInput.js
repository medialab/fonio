/**
 * This module provides a reusable password input component
 * @module fonio/components/PasswordInput
 */
/**
 * Imports Libraries
 */
import React from 'react';
import { Text } from 'react-form';
import {
  Control,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';

const PasswordInput = ( { id = 'password' } ) => (
  <Control>
    <StretchedLayoutContainer
      style={ { alignItems: 'center' } }
      isDirection={ 'horizontal' }
    >
      <StretchedLayoutItem>
        <FontAwesomeIcon
          icon={ faLock }
        />
      </StretchedLayoutItem>
      <StretchedLayoutItem
        style={ { marginLeft: '1rem' } }
        isFlex={ 1 }
      >
        <Text
          className={ 'input' }
          field={ id }
          id={ id }
          type={ 'password' }
        />
      </StretchedLayoutItem>

    </StretchedLayoutContainer>
  </Control>
);

export default PasswordInput;
