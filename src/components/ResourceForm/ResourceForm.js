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
const credentials = CONFIG;

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

  generateDataForm = (resourceType, resource, formApi) => {
    const {translate} = this;
    switch (resourceType) {
      case 'video':
        const onVideoUrlChange = (thatUrl) => {
          retrieveMediaMetadata(thatUrl, credentials)
            .then(({metadata}) => {
              Object.keys(metadata)
                .forEach(key => {
                  formApi.setValue(`metadata.${key}`, metadata[key]);
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
      case 'embed':
        return (
          <Field>
            <Control>
              <Label>
                {translate('Embed code')}
                <HelpPin place="right">
                  {translate('Explanation about the embed')}
                </HelpPin>
              </Label>
              <TextArea
                field="data.html" id="data.html"
                type="text"
                placeholder={translate('Embed code')} />
            </Control>
          </Field>
        );
      case 'webpage':
        return (
          <Column>
            <Field>
              <Control>
                <Label>
                  {translate('Webpage name')}
                  <HelpPin place="right">
                    {translate('Explanation about the webpage')}
                  </HelpPin>
                </Label>
                <Text
                  field="data.name" id="data.name"
                  type="text"
                  placeholder={translate('name')} />
              </Control>
            </Field>
            <Field>
              <Control>
                <Label>
                  {translate('hyperlink')}
                  <HelpPin place="right">
                    {translate('Explanation about the hyperlink')}
                  </HelpPin>
                </Label>
                <Text
                  field="data.url" id="data.url"
                  type="text"
                  placeholder={translate('http://')} />
              </Control>
            </Field>
          </Column>
        );
      case 'glossary':
        return (
          <Column>
            <Field>
              <Control>
                <Label>
                  {translate('Glossary name')}
                  <HelpPin place="right">
                    {translate('Explanation about the glossary')}
                  </HelpPin>
                </Label>
                <Text
                  field="data.name" id="data.name"
                  type="text"
                  placeholder={translate('glossary name')} />
              </Control>
            </Field>
            <Field>
              <Control>
                <Label>
                  {translate('Glossary description')}
                  <HelpPin place="right">
                    {translate('Explanation about the glossary description')}
                  </HelpPin>
                </Label>
                <TextArea
                  type="text"
                  field="data.description"
                  id="data.description"
                  placeholder={translate('glossary description')} />
              </Control>
            </Field>
          </Column>
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

    // const updateTempResource = (key, subKey, value) => {
    //   this.setState({
    //     resource: {
    //       ...resource,
    //       [key]: {
    //         ...(resource[key] : {}),
    //         [subKey]: value
    //       }
    //     }
    //   });
    // };
    const onResourceTypeChange = (thatType, formApi) => {
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
                  {generateDataForm(formApi.getValue('metadata.type'), resource, formApi)}
                </Column>
                {formApi.getValue('metadata.type') !== 'glossary' &&
                  <Column>
                    <Title isSize={5}>
                      {translate('Preview')}
                    </Title>
                    <AssetPreview
                      resource={formApi.values} />
                  </Column>
                }
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
