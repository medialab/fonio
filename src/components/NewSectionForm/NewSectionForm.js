import React from 'react';
import PropTypes from 'prop-types';

import {Form, Text} from 'react-form';
import {
  Button,
  Column,
  Control,
  Field,
  HelpPin,
  // Icon,
  Label,
  // Level,
  // Input,
  // TextArea,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Help,
} from 'quinoa-design-library/components/';

import AuthorsManager from '../AuthorsManager';

import {translateNameSpacer} from '../../helpers/translateUtils';

const NewSectionForm = ({
  metadata,
  onSubmit,
  onCancel,
  submitMessage,
  style = {},
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
      validate={errorValidator}
      onSubmitFailure={onSubmitFailure}
      onSubmit={onSubmitMetadata}>
      {formApi => (
        <form
          style={style}
          onSubmit={formApi.submitForm}>
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem isFlex={1} isFlowing>
              <Column>
                <Field>
                  <Control>
                    <Label>
                      {translate('Section title')}
                      <HelpPin place="right">
                        {translate('Explanation about the section title')}
                      </HelpPin>
                    </Label>
                    <Text
                      className="input"
                      field="title" id="title" type="text"
                      placeholder={translate('Section title')} />
                  </Control>
                </Field>
                {
                  formApi.errors && formApi.errors.title &&
                  <Help
                    isColor="danger">
                    {formApi.errors.title}
                  </Help>
                }
                <AuthorsManager
                  field="authors"
                  id="authors"
                  title={translate('Section authors')}
                  titleHelp={translate('help about section authors')}
                  onChange={(authors) => formApi.setValue('authors', authors)}
                  authors={formApi.getValue('authors')} />
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem>
              <StretchedLayoutContainer isDirection="horizontal">
                <StretchedLayoutItem isFlex={1}>
                  <Column>
                    <Button
                      isDisabled={!formApi.getValue('title').length} isFullWidth type="submit"
                      isColor="success">
                      {submitMessage || translate('Create and start editing')}
                    </Button>
                  </Column>
                </StretchedLayoutItem>
                <StretchedLayoutItem isFlex={1}>
                  <Column>
                    <Button onClick={onCancel} isFullWidth isColor="danger">
                      {translate('Cancel')}
                    </Button>
                  </Column>
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </form>
      )}
    </Form>
  );
};


NewSectionForm.contextTypes = {
  t: PropTypes.func,
};
export default NewSectionForm;
