/* eslint react/no-set-state : 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import resourceSchema from 'quinoa-schemas/resource';

import {translateNameSpacer} from '../../helpers/translateUtils';
import {validate} from '../../helpers/schemaUtils';
import {
  BigSelect,
  Button,
  Column,
  Columns,
  Control,
  Delete,
  Field,
  HelpPin,
  Input,
  Label,
  Level,
  TextArea,
  Title,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import AssetPreview from '../AssetPreview';

const resourcesSchemas = {
  video: {}
};
const resourceTypes = Object.keys(resourcesSchemas);
// const resourceTypes = ['bib', 'image', 'video', 'embed', 'webpage', 'table', 'glossary'];

class ResourceForm extends Component {

  constructor(props, context) {
    super(props);
    this.state = {
      resource: undefined
    };
    this.translate = translateNameSpacer(context.t, 'Components.ResourceForm');
  }

  componentWillMount = () => {
    if (this.props.resource) {
      this.setState({resource: this.props.resource});
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.resource !== nextProps.resource) {
      this.setState({
        resource: nextProps.resource
      });
    }
  }

  generateDataForm = (resourceType, resource, onChange) => {
    const {translate} = this;
    switch (resourceType) {
      case 'video':
        const url = resource.data && resource.data.url ? resource.data.url : '';
        const onVideoUrlChange = e => onChange('data', 'url', e.target.value);
        return (
          <Field>
            <Control>
              <Label>
                {translate('Url of the video')}
                <HelpPin place="right">
                  {translate('Explanation about the video url')}
                </HelpPin>
              </Label>
              <Input
                value={url} onChange={onVideoUrlChange} type="text"
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
        // resource = {},
        resourceType: propResourceType,
        onCancel,
        onSubmit
      },
      state: {
        resource = {}
      },
      translate,
      generateDataForm
    } = this;
    const {
      metadata = {}
    } = resource;
    const {
      type,
      title = '',
      source = '',
      description = '',
    } = metadata;
    const resourceType = type || propResourceType;

    const handleSubmit = () => {
      const dataSchema = resourceSchema.definitions[resourceType];
      if (validate(resourceSchema, resource) && validate(dataSchema, resource.data)) {
        onSubmit(resource);
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
    const onResourceTypeChange = thatType => updateTempResource('metadata', 'type', thatType);
    const onResourceTitleChange = thatTitle => updateTempResource('metadata', 'title', thatTitle);
    const onResourceSourceChange = thatSource => updateTempResource('metadata', 'source', thatSource);
    const onResourceDescriptionChange = thatDescription => updateTempResource('metadata', 'description', thatDescription);

    return (
      <div>
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
        {asNewResource && <BigSelect
          activeOptionId={resourceType}
          onChange={onResourceTypeChange}
          options={
                  resourceTypes.map(thatType => ({
                    id: thatType,
                    label: thatType,
                    iconUrl: icons[thatType].black.svg
                  }))
                } />}
        {resourceType && <Columns>
          <Column>
            {generateDataForm(resourceType, resource, updateTempResource)}
          </Column>
          <Column>
            <Title isSize={5}>
              {translate('Preview')}
            </Title>
            <AssetPreview
              resource={resource} />
          </Column>
        </Columns>}
        <Level />
        {resourceType && <Columns>
          <Column>
            <Field>
              <Control>
                <Label>
                  {translate('Title of the resource')}
                  <HelpPin place="right">
                    {translate('Explanation about the resource title')}
                  </HelpPin>
                </Label>
                <Input
                  type="text"
                  placeholder={translate('Resource title')}
                  value={title}
                  onChange={e => onResourceTitleChange(e.target.value)} />
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
                <Input
                  type="text"
                  placeholder={translate('Resource source')}
                  value={source}
                  onChange={e => onResourceSourceChange(e.target.value)} />
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
                  placeholder={translate('Resource description')}
                  value={description}
                  onChange={e => onResourceDescriptionChange(e.target.value)} />
              </Control>
            </Field>
          </Column>
        </Columns>}
        {resourceType &&
        <Level>
          <Button
            type="submit"
            isFullWidth
            onClick={handleSubmit}
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
      </div>
    );
  }
}

ResourceForm.contextTypes = {
  t: PropTypes.func,
};

export default ResourceForm;
