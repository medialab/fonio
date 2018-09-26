import React from 'react';
import PropTypes from 'prop-types';

import { translateNameSpacer } from '../../../helpers/translateUtils';

import {
  Button,
  ModalCard,
  Field,
  Help,
} from 'quinoa-design-library/components/';

import { Form } from 'react-form';

import PasswordInput from '../../../components/PasswordInput';
import ExplainedLabel from '../../../components/ExplainedLabel';

const EnterPasswordModal = ( {
  mode,
  status,
  loginStatus,
  onSubmitPassword,
  onCancel
}, {
  t
} ) => {
  const translate = translateNameSpacer( t, 'Components.EnterPasswordModal' );

  const handleSubmitForm = ( values ) => {
    onSubmitPassword( values.password );
  };

  const errorValidator = ( values ) => {
    return {
      password: ( !values.password || ( mode === 'create' && values.password.length < 6 ) ) ? translate( 'Password should be at least 6 characters' ) : null,
    };
  };

  return (
    <Form
      onSubmit={ handleSubmitForm }
      validate={ errorValidator }
    >
      {
        ( formApi ) => {
          const handleSubmit = formApi.submitForm;
          return (
            <form
              onSubmit={ handleSubmit }
              className={ 'fonio-form' }
            >
              <ModalCard
                isActive
                headerContent={ mode === 'create' ? translate( 'Create story' ) : translate( 'Override story' ) }
                onClose={ onCancel }
                mainContent={
                  <Field>
                    <ExplainedLabel
                      title={ mode === 'create' ? translate( 'Create a story password' ) : translate( 'Enter password of the story' ) }
                      explanation={ translate( 'Explanation about the password' ) }
                    />
                    <PasswordInput id={ 'password' } />
                    {
                      formApi.touched.password && formApi.errors && formApi.errors.password &&
                      <Help isColor={ 'danger' }>{formApi.errors.password}</Help>
                    }
                    {
                      mode === 'override' && loginStatus === 'fail' &&
                      <Help isColor={ 'danger' }>{translate( 'Password is not valid' )}</Help>
                    }
                    {status === 'fail' &&
                    <Help isColor={ 'danger' }>
                      { mode === 'create' ?
                                  translate( 'Story could not be created' ) :
                                  translate( 'Story could not be overrided' )
                      }
                    </Help>
                    }
                  </Field>
                      }
                footerContent={ [
                  <Button
                    type={ 'submit' }
                    isFullWidth
                    key={ 0 }
                    isColor={ 'danger' }
                  >{mode === 'create' ? translate( 'Create' ) : translate( 'Override' )}
                  </Button>,
                  <Button
                    isFullWidth
                    key={ 2 }
                    onClick={ onCancel }
                  >
                    {translate( 'Cancel' )}
                  </Button>
                    ] }
              />
            </form>
                );
}
      }
    </Form>
  );
};

EnterPasswordModal.propTypes = {
  loginStatus: PropTypes.string,
  onCancel: PropTypes.func,
  onDeleteStory: PropTypes.func,
};

EnterPasswordModal.contextTypes = {
  t: PropTypes.func
};

export default EnterPasswordModal;
