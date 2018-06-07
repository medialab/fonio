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
  Input,
  Help
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';


const AuthManagerLayout = ({
  storyLoginId,
  actions: {

  }
}, {t}) => {
  const translate = translateNameSpacer(t, 'Features.AuthManager');
  return storyLoginId ? (
    <ModalCard
      isActive
      headerContent={translate('Connect to a story')}
      mainContent={
        <form>
          <Field>
            <Label>
              {translate('Enter your password')}
              <HelpPin place="right">
                {translate('Explanation about the password')}
              </HelpPin>
            </Label>
            <Control hasIcons>
              <Input
                isColor="success" placeholder="Text Input" value="bloomer"
                type="password" />
              <Icon isSize="small" isAlign="left">
                <span className="fa fa-lock" aria-hidden="true" />
              </Icon>
              <Icon isSize="small" isAlign="right">
                <span className="fa fa-exclamation" aria-hidden="true" />
              </Icon>
            </Control>
            <Help>{translate('Submitting password')}</Help>
            <Help isColor="danger">{translate('Password is not valid')}</Help>
          </Field>
        </form>
      }
      footerContent={[
        <Button isFullWidth key={0} isColor="success">{translate('Enter')}</Button>,
        <Button isFullWidth key={1} isColor="warning">{translate('Read')}</Button>,
        <Button isFullWidth key={2} >{translate('Back to home')}</Button>
      ]} />
  ) : null;
};

AuthManagerLayout.contextTypes = {
  t: PropTypes.func,
};

export default AuthManagerLayout;
