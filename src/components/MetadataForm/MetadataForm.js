import React from 'react';
import PropTypes from 'prop-types';

import {Form, Text, TextArea} from 'react-form';
import {
  Button,
  Control,
  Field,
  HelpPin,
  Icon,
  Label,
  // Input,
  // TextArea,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Help,
} from 'quinoa-design-library/components/';

import AuthorsManager from '../AuthorsManager';

import {translateNameSpacer} from '../../helpers/translateUtils';

const MetadataForm = ({
  story,
  status,
  onSubmit,
  onCancel
}, {t}) => {

  const translate = translateNameSpacer(t, 'Components.MetadataForm');

  const errorValidator = (values) => {
    return {
      title: !values.title ? translate('Story title is required') : null,
      password: (!story.id && (!values.password || values.password.length < 6)) ? translate('Password should be at least 6 characters') : null,
    };
  };

  const onSubmitForm = (values) => {
    const newValues = {...values};
    delete newValues.password;
    // parse authors
    const authors = newValues.authors
                    // .reduce((result, item) => result.concat(item.split(',')), [])
                    .map(d => d.trim())
                    .filter(d => d.length > 0);
    const payload = {
      ...story,
      metadata: {
        ...story.metadata,
        ...newValues,
        authors
      },
    };
    onSubmit({payload, password: values.password});
  };

  return (
    <Form
      defaultValues={story.metadata}
      validate={errorValidator}
      onSubmit={onSubmitForm}>
      {formApi => (
        <form onSubmit={formApi.submitForm}>
          <Field>
            <Control>
              <Label>
                {translate('Story title')}
                <HelpPin place="right">
                  {translate('Explanation about the story title')}
                </HelpPin>
              </Label>
              <Text
                className="input"
                field="title" id="title" type="text"
                placeholder={translate('title')} />
              {/*<Input type="text" placeholder="Story title" />*/}
            </Control>
            {
              formApi.touched.title && formApi.errors && formApi.errors.title &&
                <Help isColor="danger">{formApi.errors.title}</Help>
            }
          </Field>
          <Field>
            <Control>
              <Label>
                {translate('Story subtitle')}
                <HelpPin place="right">
                  {translate('Explanation about the story subtitle')}
                </HelpPin>
              </Label>
              <Text
                className="input"
                field="subtitle" id="subtitle" type="text"
                placeholder={translate('subtitle')} />
              {/*<Input type="text" placeholder="A song of ice and fire" />*/}
            </Control>
          </Field>
          {
            !story.id &&
              <Field>
                <Label>
                  {translate('Story password')}
                  <HelpPin place="right">
                    {translate('Explanation about the story password')}
                  </HelpPin>
                </Label>
                <Control hasIcons>
                  <Text
                    className="input"
                    field="password"
                    id="password"
                    autoComplete="new-password"
                    type="password"
                    placeholder="password" />
                  {/*<Input isColor="success" placeholder="Text Input" value="bloomer" type="password" />*/}
                  <Icon isSize="small" isAlign="left">
                    <span className="fa fa-lock" aria-hidden="true" />
                  </Icon>
                  <Icon isSize="small" isAlign="right">
                    <span className="fa fa-exclamation" aria-hidden="true" />
                  </Icon>
                </Control>
                {
                  formApi.touched.password && formApi.errors && formApi.errors.password &&
                    <Help isColor="danger">{formApi.errors.password}</Help>
                }
              </Field>
          }
          <AuthorsManager
            field="authors"
            id="authors"
            onChange={(authors) => formApi.setValue('authors', authors)}
            authors={formApi.getValue('authors')} />
          <Field>
            <Label>{translate('Story Abstract')}</Label>
            <Control hasIcons>
              <TextArea
                className="textarea"
                field="abstract"
                id="abstract"
                type="text"
                placeholder={translate('abstract')} />
            </Control>
          </Field>
          {!story.id && status === 'processing' && <Help>{translate('Creating story')}</Help>}
          {!story.id && status === 'fail' && <Help isColor="danger">{translate('Story could not be created')}</Help>}
          <StretchedLayoutContainer isDirection="horizontal">
            <StretchedLayoutItem isFlex={1}>
              <Button isFullWidth type="submit" isColor="success">
                {story.id ?
                  <span>{translate('Update settings')}</span> :
                  <span>{translate('Create story')}</span>
                }
              </Button>
            </StretchedLayoutItem>
            <StretchedLayoutItem isFlex={1}>
              <Button onClick={onCancel} isFullWidth isColor="danger">
                {translate('Cancel')}
              </Button>
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </form>
      )}
    </Form>
  );
};


MetadataForm.contextTypes = {
  t: PropTypes.func,
};
export default MetadataForm;
