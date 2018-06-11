import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

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

const DeleteStoryModal = ({
  loginStatus,
  onDeleteStory,
  onCancel
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Components.DeleteStoryModal');

  const onSumitForm = values => {
    onDeleteStory(values.password);
  };

  return (
    <Form onSubmit={onSumitForm}>
      {
        formApi => (
          <form onSubmit={formApi.submitForm} id="login-form" className="fonio-form">
            <ModalCard
              isActive
              headerContent={translate('Delete a story')}
              mainContent={
                <Field>
                  <Label>
                    {translate('Enter your password')}
                    <HelpPin place="right">
                      {translate('Explanation about the password')}
                    </HelpPin>
                  </Label>
                  <Control hasIcons>
                    <Text field="password" id="password" type="password" />
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
                  isColor="danger">{translate('Delete')}</Button>,
                <Button isFullWidth key={2} onClick={onCancel} >
                  {translate('Cancel')}
                </Button>
            ]} />
          </form>
        )
      }
    </Form>
  );
};

DeleteStoryModal.propTypes = {
  loginStatus: PropTypes.string,
  onDeleteStory: PropTypes.func,
  onCancel: PropTypes.func
};

DeleteStoryModal.contextTypes = {
  t: PropTypes.func
};

export default DeleteStoryModal;
