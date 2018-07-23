import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  ModalCard,
  Field,
  Label,
  HelpPin,
  Control,
  Icon,
  Help
} from 'quinoa-design-library/components/';

import {Form, Text} from 'react-form';

import {translateNameSpacer} from '../../../helpers/translateUtils';


const AuthManagerLayout = ({
  storyLoginId,
  userId,
  loginStatus,
  history,
  actions: {
    loginStory,
    activateStory,
    setLoginStatus,
  },
  saveStoryToken
}, {t}) => {
  const translate = translateNameSpacer(t, 'Features.AuthManager');

  const loginSubmit = values => {
    loginStory({
      storyId: storyLoginId,
      userId,
      password: values.password,
    })
    .then((res) => {
      if (res.error) {
        setLoginStatus('fail');
      }
      else {
        const {token} = res.result.data;
        saveStoryToken(storyLoginId, token);
        activateStory({storyId: storyLoginId, userId, token});
      }
    });
  };

  const goReadStory = () => {
    history.push({
      pathname: `/read/${storyLoginId}`
    });
  };

  const goBackHome = () => {
    history.push({
      pathname: '/'
    });
  };

  return storyLoginId ? (
    <Form onSubmit={loginSubmit}>
      {
        formApi => (
          <form onSubmit={formApi.submitForm} id="login-form" className="fonio-form">
            <ModalCard
              isActive
              onClose={goBackHome}
              headerContent={translate('Connect to a story')}
              mainContent={
                <Field>
                  <Label>
                    {translate('Enter your password')}
                    <HelpPin place="right">
                      {translate('Explanation about the password')}
                    </HelpPin>
                  </Label>
                  <Control hasIcons>
                    <Text
                      className="input" field="password" id="password"
                      type="password" />
                    {/*<Input
                      isColor="success" placeholder="Text Input" value="bloomer"
                      type="password" />*/}
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-lock" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <span className="fa fa-exclamation" aria-hidden="true" />
                    </Icon>
                  </Control>
                  {loginStatus === 'processing' && <Help>{translate('Submitting password')}</Help>}
                  {loginStatus === 'fail' && <Help isColor="danger">{translate('Password is not valid')}</Help>}
                </Field>
            }
              footerContent={[
                <Button
                  type="submit" isFullWidth key={0}
                  isColor="success">{translate('Enter')}</Button>,
                <Button
                  isFullWidth key={1} onClick={goReadStory}
                  isColor="warning">{translate('Read')}</Button>,
                <Button isFullWidth key={2} onClick={goBackHome}>
                  {translate('Back to home')}
                </Button>
            ]} />
          </form>
        )
      }
    </Form>
  ) : null;
};

AuthManagerLayout.contextTypes = {
  t: PropTypes.func,
};

export default AuthManagerLayout;
