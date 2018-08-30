/* eslint react/no-set-state : 0 */
/* eslint react/jsx-boolean-value : 0 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import {renderToStaticMarkup} from 'react-dom/server';

// import {Bibliography} from 'react-citeproc';
// import english from 'raw-loader!../../sharedAssets/bibAssets/english-locale.xml';
// import apa from 'raw-loader!../../sharedAssets/bibAssets/apa.csl';

import {isEmpty} from 'lodash';
import {csvParse} from 'd3-dsv';
import {Form, NestedField, Text, TextArea} from 'react-form';

import resourceSchema from 'quinoa-schemas/resource';

import config from '../../config';

import AuthorsManager from '../AuthorsManager';

import {translateNameSpacer} from '../../helpers/translateUtils';
import {retrieveMediaMetadata, retrieveWebpageMetadata, loadImage, inferMetadata, parseBibTeXToCSLJSON} from '../../helpers/assetsUtils';
import {getFileAsText} from '../../helpers/fileLoader';

import {base64ToBytesLength} from '../../helpers/misc';
import {createDefaultResource, validateResource} from '../../helpers/schemaUtils';
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
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import BibRefsEditor from '../BibRefsEditor';
import AssetPreview from '../AssetPreview';


const resourceTypes = Object.keys(resourceSchema.definitions);
const credentials = {youtubeAPIKey: config.youtubeAPIKey};
const {maxResourceSize} = config;

const realMaxFileSize = base64ToBytesLength(maxResourceSize);

class DataForm extends Component {
  static contextTypes = {
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.resource !== nextProps.resource) {
      nextProps.formApi.setAllValues({data: nextProps.resource.data});
    }
  }
  render = () => {
    const {
      resource,
      resourceType,
      asNewResource,
      formApi
    } = this.props;
    const {t} = this.context;
    const translate = translateNameSpacer(t, 'Components.ResourceForm');

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
    const onDropFiles = (files) => {
      formApi.setError('maxSize', undefined);
      loadResourceData(resourceType, files[0])
      .then((data) => {
        const contentLength = JSON.stringify(data).length;
        if (contentLength > maxResourceSize) {
          formApi.setError('maxSize', translate('File is too large ({s} Mb), please choose one under {m} Mb', {s: Math.floor(contentLength / 1000000), m: realMaxFileSize / 1000000}));
        }
        const inferedMetadata = inferMetadata({...data, file: files[0]}, resourceType);
        const prevMetadata = formApi.getValue('metadata');
        const metadata = {
          ...prevMetadata,
          ...inferedMetadata,
          title: prevMetadata.title ? prevMetadata.title : inferedMetadata.title
        };
        formApi.setValue('metadata', metadata);
        formApi.setValue('data', data);

      })
      .catch(e => {
        console.error(e);/* no-console: 0*/
      });
    };
    const onEditBib = (value) => {
      const bibData = parseBibTeXToCSLJSON(value);
      // TODO: citation-js parse fail in silence, wait error handling feature
      if (bibData.length === 1) {
        formApi.setValue('data', bibData);
        formApi.setError('data', undefined);
      }
      else if (bibData.length > 1) {
        formApi.setError('data', translate('Please enter only one bibtex'));
      }
      else formApi.setError('data', translate('Invalid bibtext resource'));
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
              accept=".jpg,.jpeg,.png,.gif"
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
            {
              asNewResource ?
                <DropZone
                  accept=".bib,.txt"
                  onDrop={onDropFiles}>
                  {translate('Drop a bib file')}
                </DropZone> :
                <BibRefsEditor data={resource.data} onChange={onEditBib} />
            }
          </Control>
          {
            formApi.errors && formApi.errors.data &&
              <Help isColor="danger">{formApi.errors.data}</Help>
          }
        </Field>
      );
    case 'video':
      const onVideoUrlChange = (thatUrl) => {
        retrieveMediaMetadata(thatUrl, credentials)
          .then(({metadata}) => {
            Object.keys(metadata)
              .forEach(key => {
                const existing = formApi.getValue(`metadata.${key}`);
                if ((!existing || (typeof existing === 'string' && !existing.trim().length) || (Array.isArray(existing) && !existing.length)) && metadata[key]) {
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
              className="input"
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
              className="textarea"
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
      const onWebpageUrlChange = (thatUrl) => {
        retrieveWebpageMetadata(thatUrl)
          .then((metadata) => {
            Object.keys(metadata)
              .forEach(key => {
                const existing = formApi.getValue(`metadata.${key}`);
                if ((!existing || (typeof existing === 'string' && !existing.trim().length) || (Array.isArray(existing) && !existing.length)) && metadata[key]) {
                  formApi.setValue(`metadata.${key}`, metadata[key]);
                }
              });
          });
        // retrieveMediaMetadata(thatUrl, credentials)
        //   .then(({metadata}) => {
        //     Object.keys(metadata)
        //       .forEach(key => {
        //         formApi.setValue(`metadata.${key}`, metadata[key]);
        //       });
        //   });
      };
      return (
        <div>
          <Field>
            <Control>
              <Label>
                {translate('hyperlink')}
                <HelpPin place="right">
                  {translate('Explanation about the hyperlink')}
                </HelpPin>
              </Label>
              <Text
                className="input"
                field="url" id="url"
                type="text"
                onChange={onWebpageUrlChange}
                placeholder={translate('http://')} />
            </Control>
            {
              formApi.errors && formApi.errors.url &&
                <Help isColor="danger">{formApi.errors.url}</Help>
            }
          </Field>
        </div>
      );
    case 'glossary':
      return (
        <div>
          <Field>
            <Control>
              <Label>
                {translate('Glossary name')}
                <HelpPin place="right">
                  {translate('Explanation about the glossary')}
                </HelpPin>
              </Label>
              <Text
                className="input"
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
                className="textarea"
                type="text"
                field="description"
                id="description"
                placeholder={translate('glossary description')} />
            </Control>
          </Field>
        </div>
      );
    default:
      return null;
    }
  }
}

class ResourceForm extends Component {

  constructor(props, context) {
    super(props);
    const resource = props.resource || createDefaultResource();
    if (props.resourceType) {
      resource.metadata.type = props.resourceType;
    }
    this.state = {
      resource
    };
    this.translate = translateNameSpacer(context.t, 'Components.ResourceForm');
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.resource !== nextProps.resource) {
      const resource = nextProps.resource || createDefaultResource();
      if (nextProps.resourceType) {
        resource.metadata.type = nextProps.resourceType;
      }
      this.setState({
        resource
      });
    }
  }

  componentWillUnmount = () => {
    const {asNewResource} = this.props;
    if (!asNewResource) this.props.onCancel();
  }

  render = () => {
    const {
      props: {
        asNewResource = true,
        // resourceType: propResourceType,
        onCancel,
        onSubmit,
        resourceType,
        showTitle = true,
        bigSelectColumnsNumber = 2,
      },
      state: {
        resource = {}
      },
      translate,
    } = this;

    const handleSubmit = (candidates) => {
      onSubmit(candidates);
    };

    const onResourceTypeChange = (thatType, formApi) => {
      if (thatType === undefined) {
        //"reset type" case
        formApi.resetAll();
      }
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
        const dataRequiredValues = dataSchema.required || [];

        return {
          ...dataRequiredValues.reduce((result, key) => ({
            ...result,
            [key]: values.data[key] ? null : translate('this field is required')
          }), {
            schemaVal: validateResource(values).valid ? null : translate('resource is not valid')
          })
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
            <form className="is-wrapper" onSubmit={formApi.submitForm}>
              <StretchedLayoutContainer isAbsolute>
                {showTitle && <StretchedLayoutItem>
                  <Column>
                    <Title isSize={3}>
                      <StretchedLayoutContainer isDirection="horizontal">
                        <StretchedLayoutItem isFlex={1}>
                          {asNewResource ? translate(`Add ${(resource && resource.metadata.type) || 'item'} to the library`) : translate(`Edit ${resource && resource.metadata.type}`)}
                        </StretchedLayoutItem>
                        <StretchedLayoutItem>
                          <Delete onClick={
                          () => onCancel()
                        } />
                        </StretchedLayoutItem>
                      </StretchedLayoutContainer>
                    </Title>
                    <Level />
                  </Column>
                </StretchedLayoutItem>}
                <StretchedLayoutItem isFlowing isFlex={1}>
                  {asNewResource && !resourceType &&
                    <Column>
                      <BigSelect
                        activeOptionId={formApi.getValue('metadata.type')}
                        columns={bigSelectColumnsNumber}
                        onChange={thatType => onResourceTypeChange(thatType, formApi)}
                        boxStyle={{textAlign: 'center'}}
                        options={
                          formApi.getValue('metadata.type') ?

                                [{
                                  id: formApi.getValue('metadata.type'),
                                  label: translate(formApi.getValue('metadata.type')),
                                  iconUrl: icons[formApi.getValue('metadata.type')].black.svg
                                },
                                {
                                  id: undefined,
                                  label: translate('reset type'),
                                  iconUrl: icons.remove.black.svg
                                }]
                                :
                                resourceTypes.map(thatType => ({
                                  id: thatType,
                                  label: translate(thatType),
                                  iconUrl: icons[thatType].black.svg
                                }))
                              } />
                      </Column>
                    }

                  {(formApi.getValue('metadata.type') !== 'glossary' &&
                      formApi.getValue('metadata.type') !== 'webpage') &&
                      !isEmpty(formApi.getValue('data')) &&
                      !(formApi.errors && formApi.errors.maxSize) &&
                      <Column>
                        <Title isSize={5}>
                          {translate('Preview')}
                        </Title>
                        <AssetPreview
                          resource={formApi.values} />
                      </Column>
                    }
                  {formApi.getValue('metadata.type') && <Column>
                    <Column>
                      <NestedField defaultValues={resource.data} field="data">
                        <DataForm
                          asNewResource={asNewResource}
                          resource={resource}
                          resourceType={resource.metadata.type ? resource.metadata.type : formApi.getValue('metadata.type')}
                          formApi={formApi} />
                        {/*generateDataForm(formApi.getValue('metadata.type'), resource, formApi)*/}
                      </NestedField>
                      {
                        formApi.errors && formApi.errors.maxSize &&
                          <Help isColor="danger">{formApi.errors.maxSize}</Help>
                      }
                    </Column>

                    </Column>}
                  {formApi.getValue('metadata.type') &&
                  resourceSchema.definitions[formApi.getValue('metadata.type')].showMetadata &&
                  <Column>
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
                            className="input"
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
                            className="input"
                            type="text"
                            id="metadata.source"
                            field="metadata.source"
                            placeholder={translate('Resource source')} />
                        </Control>
                      </Field>
                      <Field>
                        <Control>
                          <AuthorsManager
                            field="metadata.authors"
                            id="metadata.authors"
                            title={translate(`Authors of the ${formApi.getValue('metadata.type')}`)}
                            titleHelp={translate(`help about ${formApi.getValue('metadata.type')} authors`)}
                            onChange={(authors) => formApi.setValue('metadata.authors', authors)}
                            authors={formApi.getValue('metadata.authors')} />
                        </Control>
                      </Field>
                      <Field>
                        <Control>
                          <Label>
                            {translate('Date of creation')}
                            <HelpPin place="right">
                              {translate('Explanation about the date')}
                            </HelpPin>
                          </Label>
                          <Text
                            className="input"
                            type="text"
                            id="metadata.date"
                            field="metadata.date"
                            placeholder={translate('Resource date')} />
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
                            className="textarea"
                            type="text"
                            field="metadata.description"
                            id="metadata.description"
                            placeholder={translate('Resource description')} />
                        </Control>
                      </Field>
                    </Column>
                  </Column>}
                  {/*
                    formApi.errors && formApi.errors.schemaVal &&
                      <Help isColor="danger">{translate('Resource is not valid')}</Help>
                  */}
                  <Level />

                </StretchedLayoutItem>
                <StretchedLayoutItem>
                  {/*formApi.getValue('metadata.type') &&
                    !isEmpty(formApi.getValue('data')) &&*/
                    <StretchedLayoutItem>
                      <Column>
                        <Columns>
                          <Column isSize={6}>
                            <Button
                              type="submit"
                              isFullWidth
                              onClick={formApi.submitForm}
                              isDisabled={!formApi.getValue('metadata.type') || isEmpty(formApi.getValue('data'))}
                              isColor="success">
                              {asNewResource ? translate(`Add ${formApi.getValue('metadata.type') || 'item'} to library`) : translate(`Update ${(resource && resource.metadata.type) || 'item'}`)}
                            </Button>
                          </Column>
                          <Column isSize={6}>
                            <Button
                              isFullWidth
                              isColor="danger"
                              onClick={onCancel}>
                              {translate('Cancel')}
                            </Button>
                          </Column>
                        </Columns>
                      </Column>
                    </StretchedLayoutItem>
                    }
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
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
