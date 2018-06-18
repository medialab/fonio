/* eslint react/no-set-state : 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Form, Text, TextArea} from 'react-form';

import resourceSchema from 'quinoa-schemas/resource';

import {translateNameSpacer} from '../../helpers/translateUtils';
import {retrieveMediaMetadata} from '../../helpers/assetsUtils';
import {validate, createDefaultResource} from '../../helpers/schemaUtils';
import {
  BigSelect,
  Button,
  Column,
  Columns,
  Control,
  Delete,
  Field,
  HelpPin,
  Label,
  Level,
  Title,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import AssetPreview from '../AssetPreview';

const resourceTypes = Object.keys(resourceSchema.definitions);
const credentials = CONFIG;/* eslint no-undef : 0 */

class ResourceForm extends Component {

  constructor(props, context) {
    super(props);
    this.state = {
      resource: props.resource || createDefaultResource()
    };
    this.translate = translateNameSpacer(context.t, 'Components.ResourceForm');
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.resource !== nextProps.resource) {
      this.setState({
        resource: nextProps.resource || createDefaultResource()
      });
    }
  }

  generateDataForm = (resourceType, resource, onChange, formApi) => {
    const {translate} = this;
    switch (resourceType) {
      case 'video':

        const onVideoUrlChange = (thatUrl) => {
          onChange('data', 'url', thatUrl);
          retrieveMediaMetadata(thatUrl, credentials)
            .then(({metadata}) => {
              Object.keys(metadata)
                .forEach(key => {
                  const ex = formApi.getValue(`metadata.${key}`);
                  if (!(ex && ex.length)) {
                    formApi.setValue(`metadata.${key}`, metadata[key]);
                  }
                });
            });
        };
        return (
          <Field>
            <Control>
              <Label>
                {translate('Url of the video')}
                <HelpPin place="right">
                  {translate('Explanation about the video url')}
                </HelpPin>
              </Label>
              <Text
                field="data.url" id="data.url"
                onChange={onVideoUrlChange}
                type="text"
                placeholder={translate('Video url')} />
            </Control>
          </Field>
        );
      default:
        return null;
    }
  };

  render = () => {
    const {
      props: {
        asNewResource = true,
        // resourceType: propResourceType,
        onCancel,
        onSubmit
      },
      state: {
        resource = {}
      },
      translate,
      generateDataForm
    } = this;


    const handleSubmit = (values) => {
      const dataSchema = resourceSchema.definitions[values.metadata.type];
      if (validate(resourceSchema, values).valid && validate(dataSchema, values.data).valid) {
        onSubmit(values);
      }
    };

    const updateTempResource = (key, subKey, value) => {
      this.setState({
        resource: {
          ...resource,
          [key]: {
            ...(resource[key] : {}),
            [subKey]: value
          }
        }
      });
    };
    const onResourceTypeChange = (thatType, formApi) => {
      console.log(thatType, formApi);
      formApi.setValue('metadata.type', thatType);
    };

    const onSubmitFailure = error => {
      console.log(error);/* eslint no-console : 0 */
    };

    const errorValidator = (values) => {
      if (values.metadata.type) {
        const dataSchema = resourceSchema.definitions[values.metadata.type];
        const dataRequiredValues = dataSchema.requiredValues || [];
        return {
          ...dataRequiredValues.reduce((result, key) => ({
            ...result,
            [key]: values.data[key] ? null : translate('this field is required')
          }), {})
        };
      }
    };

    return (
      <Form
        defaultValues={resource}
        validateError={errorValidator}
        onSubmitFailure={onSubmitFailure}
        onSubmit={handleSubmit}>
        {
          formApi => (
            <form onSubmit={formApi.submitForm}>
              <Level />
              <Title isSize={2}>
                <Columns>
                  <Column isSize={11}>
                    {asNewResource ? translate('Create a new resource') : translate('Edit resource')}
                  </Column>
                  <Column>
                    <Delete onClick={
                      () => onCancel()
                    } />
                  </Column>
                </Columns>
              </Title>
              {asNewResource &&
              <BigSelect
                activeOptionId={formApi.getValue('metadata.type')}
                onChange={thatType => onResourceTypeChange(thatType, formApi)}
                options={
                        resourceTypes.map(thatType => ({
                          id: thatType,
                          label: thatType,
                          iconUrl: icons[thatType].black.svg
                        }))
                      } />}
              {formApi.getValue('metadata.type') && <Columns>
                <Column>
                  {generateDataForm(formApi.getValue('metadata.type'), resource, updateTempResource, formApi)}
                </Column>
                <Column>
                  <Title isSize={5}>
                    {translate('Preview')}
                  </Title>
                  <AssetPreview
                    resource={formApi.values} />
                </Column>
              </Columns>}
              <Level />
              {formApi.getValue('metadata.type') && resourceSchema.definitions[formApi.getValue('metadata.type')].showMetadata && <Columns>
                <Column>
                  <Field>
                    <Control>
                      <Label>
                        {translate('Title of the resource')}
                        <HelpPin place="right">
                          {translate('Explanation about the resource title')}
                        </HelpPin>
                      </Label>
                      <Text
                        type="text"
                        id="metadata.title"
                        field="metadata.title"
                        placeholder={translate('Resource title')} />
                    </Control>
                  </Field>
                  <Field>
                    <Control>
                      <Label>
                        {translate('Source of the resource')}
                        <HelpPin place="right">
                          {translate('Explanation about the resource source')}
                        </HelpPin>
                      </Label>
                      <Text
                        type="text"
                        id="metadata.source"
                        field="metadata.source"
                        placeholder={translate('Resource source')} />
                    </Control>
                  </Field>
                </Column>
                <Column>
                  <Field>
                    <Control>
                      <Label>
                        {translate('Description of the resource')}
                        <HelpPin place="right">
                          {translate('Explanation about the resource description')}
                        </HelpPin>
                      </Label>
                      <TextArea
                        type="text"
                        field="metadata.description"
                        id="metadata.description"
                        placeholder={translate('Resource description')} />
                    </Control>
                  </Field>
                </Column>
              </Columns>}
              {formApi.getValue('metadata.type') &&
              <Level>
                <Button
                  type="submit"
                  isFullWidth
                  onClick={formApi.submitForm}
                  isColor="success">
                  {asNewResource ? translate('Create resource') : translate('Save resource')}
                </Button>
                <Button
                  isFullWidth
                  isColor="danger"
                  onClick={onCancel}>
                  {translate('Cancel')}
                </Button>
              </Level>
                }
            </form>
          )
        }

      </Form>
    );
  }
}

ResourceForm.contextTypes = {
  t: PropTypes.func,
};

export default ResourceForm;
