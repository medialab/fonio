/* eslint react/no-set-state : 0 */
/* eslint react/jsx-boolean-value : 0 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';
import {csvParse} from 'd3-dsv';

import {Form, NestedField, Text, TextArea} from 'react-form';

import resourceSchema from 'quinoa-schemas/resource';

import {translateNameSpacer} from '../../helpers/translateUtils';
import {retrieveMediaMetadata, loadImage, inferMetadata, parseBibTeXToCSLJSON} from '../../helpers/assetsUtils';
import {getFileAsText} from '../../helpers/fileLoader';

import {validate, createDefaultResource} from '../../helpers/schemaUtils';
import {
  BigSelect,
  Button,
  Column,
  Columns,
  Control,
  Delete,
  DropZone,
  Field,
  Help,
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
    } = this;


    const loadResourceData = (type, file) =>
      new Promise((resolve, reject) => {
          switch (type) {
            case 'bib':
              return getFileAsText(file)
                .then(text => resolve(parseBibTeXToCSLJSON(text)))
                .catch(e => reject(e));
            case 'image':
              return loadImage(file)
                .then(base64 => resolve({base64}))
                .catch(e => reject(e));
            case 'table':
              return getFileAsText(file)
                .then(text => resolve({json: csvParse(text)}))
                .catch(e => reject(e));
            default:
              return reject();
          }
        });

    const DataForm = ({resourceType, formApi}) => {
      // const dataSchema = resourceSchema.definitions[resourceType];
      // const acceptedFiles = dataSchema.accept_mimetypes && dataSchema.accept_mimetypes.join(',');
      const onDropFiles = (files) => {
        loadResourceData(resourceType, files[0])
        .then((data) => {
          const inferedMetadata = inferMetadata({...data, file: files[0]}, resourceType);
          const prevMetadata = formApi.getValue('metadata');
          const metadata = {
            ...prevMetadata,
            ...inferedMetadata,
            title: prevMetadata.title ? prevMetadata.title : inferedMetadata.title
          };
          formApi.setValue('metadata', metadata);
          formApi.setValue('data', data);
        });
      };
      switch (resourceType) {
      case 'image':
        return (
          <Field>
            <Control>
              <Label>
                {translate('Image file')}
                <HelpPin place="right">
                  {translate('Explanation about the image')}
                </HelpPin>
              </Label>
              <DropZone
                accept=".jpg,.png,.gif"
                onDrop={onDropFiles}>
                {translate('Drop an image file')}
              </DropZone>
            </Control>
          </Field>
        );
      case 'table':
        return (
          <Field>
            <Control>
              <Label>
                {translate('Table')}
                <HelpPin place="right">
                  {translate('Explanation about the table')}
                </HelpPin>
              </Label>
              <DropZone
                accept=".csv,.tsv"
                onDrop={onDropFiles}>
                {translate('Drop an table file(csv, tsv)')}
              </DropZone>
            </Control>
          </Field>
        );
      case 'bib':
        return (
          <Field>
            <Control>
              <Label>
                {translate('Bib file')}
                <HelpPin place="right">
                  {translate('Explanation about the bib')}
                </HelpPin>
              </Label>
              <DropZone
                accept=".bib,.txt"
                onDrop={onDropFiles}>
                {translate('Drop an bib file')}
              </DropZone>
            </Control>
          </Field>
        );
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
                field="url" id="url"
                onChange={onVideoUrlChange}
                type="text"
                placeholder={translate('Video url')} />
            </Control>
            {
              formApi.errors && formApi.errors.url &&
                <Help isColor="danger">{formApi.errors.url}</Help>
            }
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
                field="html" id="html"
                type="text"
                placeholder={translate('Embed code')} />
            </Control>
            {
              formApi.errors && formApi.errors.html &&
                <Help isColor="danger">{formApi.errors.html}</Help>
            }
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
                  field="name" id="name"
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
                  field="url" id="url"
                  type="text"
                  placeholder={translate('http://')} />
              </Control>
              {
                formApi.errors && formApi.errors.url &&
                  <Help isColor="danger">{formApi.errors.url}</Help>
              }
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
                  field="name" id="name"
                  type="text"
                  placeholder={translate('glossary name')} />
              </Control>
              {
                formApi.errors && formApi.errors.name &&
                  <Help isColor="danger">{formApi.errors.name}</Help>
              }
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
                  field="description"
                  id="description"
                  placeholder={translate('glossary description')} />
              </Control>
            </Field>
          </Column>
        );
      default:
        return null;
      }
    };

    const validateAndSubmit = candidate => {
      const dataSchema = resourceSchema.definitions[candidate.metadata.type];
      if (validate(resourceSchema, candidate).valid && validate(dataSchema, candidate.data).valid) {
        onSubmit(candidate);
      }
      else {
        /**
         * @todo handle validation errors here
         */
        console.error(validate(resourceSchema, candidate));/* eslint no-console : 0 */
      }
    };
    const handleSubmit = (candidates) => {
      if (candidates.metadata.type === 'bib') {
        candidates.data.forEach(datum => {
          validateAndSubmit({
            ...createDefaultResource(),
            metadata: {
              ...candidates.metadata,
            },
            data: [datum]
          });
        });
      }
      else {
        validateAndSubmit(candidates);
      }
    };

    const onResourceTypeChange = (thatType, formApi) => {
      const defaultResource = createDefaultResource();
      formApi.setAllValues(defaultResource);
      formApi.setValue('metadata.type', thatType);
    };

    const onSubmitFailure = error => {
      console.log(error);/* eslint no-console : 0 */
    };

    const errorValidator = (values) => {
      if (values.metadata.type) {
        const dataSchema = resourceSchema.definitions[values.metadata.type];
        const dataRequiredValues = dataSchema.requiredProperties || [];
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
        validate={errorValidator}
        validateOnSubmit={true}
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
                  <NestedField defaultValues={resource.data} field="data">
                    <DataForm resourceType={formApi.getValue('metadata.type')} formApi={formApi} />
                    {/*generateDataForm(formApi.getValue('metadata.type'), resource, formApi)*/}
                  </NestedField>
                </Column>
                {(formApi.getValue('metadata.type') !== 'glossary' &&
                  formApi.getValue('metadata.type') !== 'webpage') &&
                  !isEmpty(formApi.getValue('data')) &&
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
                !isEmpty(formApi.getValue('data')) &&
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
