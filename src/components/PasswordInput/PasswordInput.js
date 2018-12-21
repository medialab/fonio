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
  Icon,
} from 'quinoa-design-library/components/';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

const PasswordInput = ( { id = 'password' } ) => (
  <Control hasIcons>
    <Text
      className={ 'input' }
      field={ 'password' }
      id={ id }
      type={ 'password' }
    />
    <Icon
      isSize={ 'small' }
      isAlign={ 'left' }
    >
      <FontAwesomeIcon
        icon={ faLock }
      />
    </Icon>
  </Control>
);

export default PasswordInput;
