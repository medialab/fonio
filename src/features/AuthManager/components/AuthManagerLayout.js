/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-form';
import {
  Button,
  ModalCard,
  Field,
  Help
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import PasswordInput from '../../../components/PasswordInput';
import ExplainedLabel from '../../../components/ExplainedLabel';

const AuthManagerLayout = ( {
  storyLoginId,
  userId,
  loginStatus,
  history,
  actions: {
    loginStory,
    activateStory,
    setLoginStatus,
    setStoryLoginId,
  },
  saveStoryToken
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Features.AuthManager' );

  const loginSubmit = ( values ) => {
    loginStory( {
      storyId: storyLoginId,
      userId,
      password: values.password,
    } )
    .then( ( res ) => {
      if ( res.error ) {
        setLoginStatus( 'fail' );
      }
      else {
        const { token } = res.result.data;
        saveStoryToken( storyLoginId, token );
        activateStory( { storyId: storyLoginId, userId, token } );
      }
    } );
  };

  const goReadStory = () => {
    setStoryLoginId( undefined );
    history.push( {
      pathname: `/read/${storyLoginId}`
    } );
  };

  const goBackHome = () => {
    setStoryLoginId( undefined );
    history.push( {
      pathname: '/'
    } );
  };

  return storyLoginId ? (
    <Form onSubmit={ loginSubmit }>
      {
        ( formApi ) => {
          const handleSubmit = formApi.submitForm;
          return (
            <form
              onSubmit={ handleSubmit }
              id={ 'login-form' }
              className={ 'fonio-form' }
            >
              <ModalCard
                isActive
                onClose={ goBackHome }
                headerContent={ translate( 'Connect to a story' ) }
                mainContent={
                  <Field>
                    <ExplainedLabel
                      title={ translate( 'Enter your password' ) }
                      explanation={ translate( 'Explanation about the password' ) }
                    />
                    <PasswordInput />
                    {loginStatus === 'processing' && <Help>{translate( 'Submitting password' )}</Help>}
                    {loginStatus === 'fail' && <Help isColor={ 'danger' }>{translate( 'Password is not valid' )}</Help>}
                  </Field>
                      }
                footerContent={ [
                  <Button
                    type={ 'submit' }
                    isFullWidth
                    key={ 0 }
                    isColor={ 'success' }
                  >{translate( 'Enter' )}
                  </Button>,
                  <Button
                    isFullWidth
                    key={ 1 }
                    onClick={ goReadStory }
                    isColor={ 'warning' }
                  >{translate( 'Read' )}
                  </Button>,
                  <Button
                    isFullWidth
                    key={ 2 }
                    onClick={ goBackHome }
                  >
                    {translate( 'Back to home' )}
                  </Button>
                    ] }
              />
            </form>
                );
}
      }
    </Form>
  ) : null;
};

AuthManagerLayout.contextTypes = {
  t: PropTypes.func,
};

export default AuthManagerLayout;
