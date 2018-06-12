import React from 'react';
import PropTypes from 'prop-types';

import {Form, Text} from 'react-form';
import {
  Button,
  Column,
  Columns,
  Control,
  Field,
  HelpPin,
  // Icon,
  Label,
  // Level,
  // Input,
  // TextArea,
  Help,
} from 'quinoa-design-library/components/';

import AuthorsManager from '../AuthorsManager';

import {translateNameSpacer} from '../../helpers/translateUtils';

const NewSectionForm = ({
  metadata,
  onSubmit,
  onCancel,
  submitMessage
}, {t}) => {

  const translate = translateNameSpacer(t, 'Components.NewSectionForm');

   const errorValidator = (values) => {
    return {
      title: !values.title ? translate('section-title-is-required') : null,
    };
  };


  const onSubmitFailure = error => {
    console.log(error);/* eslint no-console : 0 */
  };

  const onSubmitMetadata = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      defaultValues={metadata}
      validateError={errorValidator}
      onSubmitFailure={onSubmitFailure}
      onSubmit={onSubmitMetadata}>
      {formApi => (
        <form onSubmit={formApi.submitForm}>
          <Field>
            <Control>
              <Label>
                {translate('Section title')}
                <HelpPin place="right">
                  {translate('Explanation about the section title')}
                </HelpPin>
              </Label>
              <Text
                field="title" id="title" type="text"
                placeholder={translate('Section title')} />
            </Control>
          </Field>
          {
            formApi.errors.title &&
            <Help
              isColor="danger">
              {formApi.errors.title}
            </Help>
          }
          <AuthorsManager
            field="authors"
            id="authors"
            onChange={(authors) => formApi.setValue('authors', authors)}
            authors={formApi.getValue('authors')} />

          <Columns>
            <Column>
              <Button isFullWidth type="submit" isColor="success">
                {submitMessage || translate('Create and start editing')}
              </Button>
            </Column>

            <Column>
              <Button onClick={onCancel} isFullWidth isColor="danger">
                {translate('Cancel')}
              </Button>
            </Column>
          </Columns>
        </form>
      )}
    </Form>
  );
};


NewSectionForm.contextTypes = {
  t: PropTypes.func,
};
export default NewSectionForm;
