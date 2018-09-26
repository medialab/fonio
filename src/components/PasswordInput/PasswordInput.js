import React from 'react';

import { Text } from 'react-form';

import {
  Control,
  Icon,
} from 'quinoa-design-library/components/';

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
      <span
        className={ 'fa fa-lock' }
        aria-hidden={ 'true' }
      />
    </Icon>
  </Control>
);

export default PasswordInput;
