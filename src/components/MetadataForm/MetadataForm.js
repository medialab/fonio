import React from 'react';
import PropTypes from 'prop-types';

import {Form, Text, TextArea} from 'react-form';
import {
  Button,
  Column,
  Columns,
  Control,
  Field,
  HelpPin,
  Icon,
  Label,
  // Input,
  Delete,
  // TextArea,
  Help,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../helpers/translateUtils';

const MetadataForm = ({
  story,
  onSubmit,
  onCancel
}, {t}) => {
  // const errorValidator = (values) => {
  //   return {
  //     title: !values.title ? this.translate('story-title-is-required') : null,
  //     password: (!values.password || values.password.length < 6) ? this.translate('password-should-be-at-least-6-characters') : null,
  //     authors: values.authors.length < 1 || (values.authors.length === 1 && values.authors[0].trim().length === 0) ? this.translate('enter-an-author-name') : null
  //   };
  // };

  const onSubmitStory = (values) => {
    const newValues = {...values};
    delete newValues.password;
    const payload = {
      ...story,
      metadata: {
        ...story.metadata,
        ...newValues
      },
    };
    onSubmit({payload, password: values.password});
  };

  const onSubmitFailure = (error, onsubmitError, formApi) => {
    console.log(error);
  };
  return (
    <Form
      defaultValues={story.metadata}
      // validateError={errorValidator}
      onSubmitFailure={onSubmitFailure}
      onSubmit={onSubmitStory}>
      {formApi => (
        <form onSubmit={formApi.submitForm}>
          <Field>
            <Control>
              <Label>
              Story title
                <HelpPin place="right">
                Explanation about the story title
                </HelpPin>
              </Label>
              <Text
                field="title" id="title" type="text"
                placeholder="Story title" />
              {/*<Input type="text" placeholder="Story title" />*/}
            </Control>
          </Field>
          <Field>
            <Control>
              <Label>
              Story subtitle
                <HelpPin place="right">
                Explanation about the story subtitle
                </HelpPin>
              </Label>
              <Text
                field="subtitle" id="subtitle" type="text"
                placeholder="subtitle" />
              {/*<Input type="text" placeholder="A song of ice and fire" />*/}
            </Control>
          </Field>

          <Field>
            <Label>
            Story password
              <HelpPin place="right">
              Explanation about the story password
              </HelpPin>
            </Label>
            <Control hasIcons>
              <Text
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
            <Help isColor="danger">Password must be at least 6 characters long</Help>
          </Field>

          <Field>
            <Label>
              Authors
              <HelpPin place="right">
              Explanation about the story authors
              </HelpPin>
            </Label>
            <Control hasIcons>
              {/*<Input isColor="success" placeholder="Text Input" value="bloomer" />*/}
              <Text
                id="author"
                type="text" />
              <Icon isSize="small" isAlign="left">
                <span className="fa fa-user" aria-hidden="true" />
              </Icon>
              <Icon isSize="small" isAlign="right">
                <Delete />
              </Icon>
              <Button>
              Add an author
              </Button>
            </Control>
          </Field>
          <Field>
            <Label>Abstract</Label>
            <Control hasIcons>
              <TextArea
                field="description"
                id="description"
                type="text"
                placeholder={'abstract'} />
            </Control>
          </Field>
          <Columns>
            <Column>
              <Button isFullWidth type="submit" isColor="success">
                Create a new story
              </Button>
            </Column>
            <Column>
              <Button onClick={onCancel} isFullWidth isColor="danger">
                Cancel
              </Button>
            </Column>
          </Columns>
        </form>
      )}
    </Form>
  );
};


MetadataForm.contextTypes = {
  t: PropTypes.func,
};
export default MetadataForm;
