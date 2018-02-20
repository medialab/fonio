/**
 * This module exports a stateless dialog component for editing a resource
 * @module fonio/features/ResourcesManager
 */

import React from 'react';
import PropTypes from 'prop-types';

import Textarea from 'react-textarea-autosize';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import downloadFile from '../../../helpers/fileDownloader';

import BigSelect from '../../../components/BigSelect/BigSelect';
import HelpPin from '../../../components/HelpPin/HelpPin';
import Toaster from '../../../components/Toaster/Toaster';
import DropZone from '../../../components/DropZone/DropZone';
import AssetPreview from '../../../components/AssetPreview/AssetPreview';
import BibRefsEditor from '../../../components/BibRefsEditor/BibRefsEditor';
import OptionSelect from '../../../components/OptionSelect/OptionSelect';

import './ResourceConfigurationDialog.scss';

/**
 * Renders the proper data input component regarding
 * the type of resource being edited, as a pure function.
 * @param {object} props - properties provided to the component
 * @param {object} context - used context data
 * @return {ReactElement} component - the current component
 */
const ResourceDataInput = ({
  type,
  submitResourceData,
  resourceCandidate
}, context) => {
  // namespacing the translation keys with feature id
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  switch (type) {
    case 'table':
      const onCsvSubmit = (files) => submitResourceData('csvFile', files[0]);
      return (
        <DropZone
          onDrop={onCsvSubmit}>
          <div>
            <p>{translate('drop-a-csv-file-here')}</p>
          </div>
        </DropZone>
      );
    case 'video':
      const onVideoUrlSubmit = (e) => submitResourceData('videoUrl', e.target.value);
      return (
        <div className="input-group">
          <label htmlFor="title">{translate('url-of-the-video')}</label>
          <input
            onChange={onVideoUrlSubmit}
            type="text"
            name="url"
            placeholder={translate('url-of-the-video')}
            value={resourceCandidate.metadata.videoUrl || ''} />
        </div>
      );
    case 'image':
      const onImageSubmit = (files) => submitResourceData('imageFile', files[0]);
      return (
        <DropZone
          onDrop={onImageSubmit}>
          <div>
            <p>{translate('drop-a-file-here')}</p>
          </div>
        </DropZone>
      );
    case 'data-presentation':
      const onPresentationSubmit = (files) => submitResourceData('dataPresentationFile', files[0]);
      const downloadPresentation = () =>
        downloadFile(
          JSON.stringify(resourceCandidate.data),
          'json',
          resourceCandidate.data.metadata.title || 'data-presentation'
        );
      return (
        <div className="data-presentation-input">
          <DropZone
            onDrop={onPresentationSubmit}>
            <div>
              <p>{translate('drop-a-file-here')}</p>
            </div>
          </DropZone>
          {resourceCandidate.data && <button onClick={downloadPresentation}>{translate('download-current-presentation-data')}</button>}
        </div>
      );
    case 'bib':
      const onBibTeXFileSubmit = (files) => submitResourceData('bibTeXFile', files[0]);

      const onRefsChange = refs => {
        submitResourceData('cslJSON', refs);
      };
      return (
        <div>
          <DropZone
            onDrop={onBibTeXFileSubmit}>
            <div>
              <p>{translate('drop-bibtex-here')}</p>
            </div>
          </DropZone>
          <BibRefsEditor
            references={resourceCandidate.data}
            onChange={onRefsChange} />
        </div>
      );
    case 'embed':
      const onEmbedSubmit = (evt) => submitResourceData('htmlCode', evt.target.value);
      return (
        <Textarea
          onChange={onEmbedSubmit}
          type="text"
          name="description"
          placeholder={translate('paste-embed-code')}
          style={{flex: 1, width: '100%'}}
          value={resourceCandidate.data || ''} />
      );
    case 'glossary':
      const onNameChange = e => submitResourceData('glossaryName', e.target.value, resourceCandidate.data);
      const onTypeChange = value => submitResourceData('glossaryType', value, resourceCandidate.data);
      return (
        <div className="input-group">
          <div className="input-group">
            <label htmlFor="title">{translate('name-of-the-glossary-entry')}</label>
            <input
              onChange={onNameChange}
              type="text"
              name="url"
              placeholder={translate('name-of-the-glossary-entry')}
              value={resourceCandidate.data && resourceCandidate.data.name || ''} />
          </div>
          <div className="input-group">
            <OptionSelect
              activeOptionId={resourceCandidate && resourceCandidate.data && resourceCandidate.data.glossaryType}
              options={[
                {
                  value: 'person',
                  label: translate('person')
                },
                {
                  value: 'place',
                  label: translate('place')
                },
                {
                  value: 'notion',
                  label: translate('notion')
                },
                {
                  value: 'other',
                  label: translate('other-glossary')
                },
              ]}
              title={translate('glossary-type')}
              onChange={onTypeChange} />
          </div>
        </div>
      );
    default:
      return null;
  }
};

/**
 * Context data used by the component
 */
ResourceDataInput.contextTypes = {
  /**
   * Un-namespaced tranlsate function
   */
  t: PropTypes.func.isRequired
};

/**
 * Renders a toaster  displaying the state of resource data loading
 * with the proper message.
 * @param {object} props - properties provided to the component
 * @param {object} context - context data used by the component
 * @return {ReactElement} component - the component
 */
const LoadingStateToaster = ({
  loadingState,
  type
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  let log;
  switch (loadingState) {
    case 'processing':
      log = type === 'loading' ? translate('loading-resource-data') : 'uploading resource';
      break;
    case 'success':
      log = type === 'loading' ? translate('loading-resource-data-success') : 'resource uploaded';
      break;
    case 'fail':
      log = type === 'loading' ? translate('loading-resource-data-fail') : 'resource cannot uploaded';
      break;
    default:
      break;
  }
  return <Toaster status={loadingState} log={log} />;
};

/**
 * Context data used by the component
 */
LoadingStateToaster.contextTypes = {
  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

/**
 * Renders a resource configuration dialog as a pure function
 * @param {object} props - the properties provided to the component
 * @param {object} context - used context data
 * @return {ReactElement} component - the component
 */
const ResourceConfigurationDialog = ({
  resourceCandidate,
  resourceCandidateId,
  resourceCandidateType,
  setResourceCandidateType,
  resourceDataLoadingState,
  resourceUploadingState,
  setResourceCandidateMetadataValue,
  submitResourceData,
  onClose,
  createResource,
  updateResource
}, context) => {
  // namespacing the translate function with the feature name
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  // todo: this should be stored elsewhere
  const resourcesTypes = [
    {
      id: 'data-presentation',
      icon: require('../assets/data-presentation.svg'),
      label: (<span>{translate('resource-type-data-presentation')} <HelpPin>
        {translate('resource-type-data-presentation-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'table',
      icon: require('../assets/table.svg'),
      label: (<span>{translate('resource-type-table')} <HelpPin>
        {translate('resource-type-table-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'image',
      icon: require('../assets/image.svg'),
      label: (<span>{translate('resource-type-image')} <HelpPin>
        {translate('resource-type-image-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'video',
      icon: require('../assets/video.svg'),
      label: (<span>{translate('resource-type-video')} <HelpPin>
        {translate('resource-type-video-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'embed',
      icon: require('../assets/embed.svg'),
      label: (<span>{translate('resource-type-embed')} <HelpPin position="left">
        {translate('resource-type-embed-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'glossary',
      icon: require('../assets/glossary.svg'),
      label: (<span>{translate('resource-type-glossary')} <HelpPin position="left">
        {translate('resource-type-glossary-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'bib',
      icon: require('../assets/bib.svg'),
      label: (<span>{translate('resource-type-bib')} <HelpPin position="left">
        {translate('resource-type-bib-help')}
      </HelpPin></span>),
      possible: true
    },

  ];
  const onApplyChange = () => {
    if (resourceCandidateId) {
      updateResource(resourceCandidateId, resourceCandidate);
    }
    else {
      // special case of batch references
      if (resourceCandidate.metadata.type === 'bib') {
        resourceCandidate.data.forEach(bib => {
          const resource = {
            metadata: {
              ...bib,
              // title: bib.title,
              type: 'bib'
            },
            data: [bib]
          };
          createResource(resource);
        });

      }
      else {
        createResource(resourceCandidate);
      }
    }
  };
  const onResourceTypeSelect = (resource) => setResourceCandidateType(resource.id);
  const setResourceTitle = (e) => setResourceCandidateMetadataValue('title', e.target.value);
  const setResourceDescription = (e) => setResourceCandidateMetadataValue('description', e.target.value);
  const setResourceSource = (e) => setResourceCandidateMetadataValue('source', e.target.value);
  return (
    <div className="fonio-resource-configuration-dialog">
      <h1 className="modal-header">
        {resourceCandidateId ? translate('edit-resource') : translate('create-resource')}
      </h1>
      <section className="modal-content">
        {resourceCandidateId === undefined ?
          <section className="modal-row">
            <BigSelect
              options={resourcesTypes}
              activeOptionId={resourceCandidateType}
              onOptionSelect={onResourceTypeSelect} />
          </section> : null}
        {resourceCandidateType ?
          <section className="modal-row">
            <h2>{translate('resource-data')}
              <HelpPin>
                {translate('resource-data-help')}
              </HelpPin>
            </h2>
            <div className="data-row">
              <div className="modal-column">
                <ResourceDataInput
                  type={resourceCandidateType}
                  resourceCandidate={resourceCandidate}
                  submitResourceData={submitResourceData} />
                <LoadingStateToaster loadingState={resourceDataLoadingState} type={'loading'} />
                <LoadingStateToaster loadingState={resourceUploadingState} type={'uploading'} />
              </div>
              {
                resourceCandidate.data && resourceCandidate.metadata.type !== 'glossary' ?
                (<div className="modal-column preview-container">
                  <h4>{translate('preview-title')}</h4>
                  <AssetPreview
                    type={resourceCandidateType}
                    data={resourceCandidate.data}
                    metadata={resourceCandidate.metadata} />
                </div>)
                : null
              }
            </div>
          </section>
          : null}
        { // @todo: make that cleaner by handling
          // for which resources types can be edited
          // and for which not in the resource types
          // model file
          resourceCandidateType &&
          (
            resourceCandidateType !== 'data-presentation' &&
            resourceCandidateType !== 'glossary' &&
            resourceCandidateType !== 'bib'
          ) ?
            <section className="modal-row">
              <h2>{translate('resource-metadata')}
                <HelpPin>
                  {translate('resource-metadata-help')}
                </HelpPin>
              </h2>
              <form className="modal-columns-container">
                <div className="modal-column">
                  <div className="input-group">
                    <label htmlFor="title">{translate('title-of-the-resource')}</label>
                    <input
                      onChange={setResourceTitle}
                      type="text"
                      name="title"
                      placeholder={translate('title-of-the-resource')}
                      value={resourceCandidate.metadata.title} />
                  </div>

                  <div className="input-group">
                    <label htmlFor="source">{translate('source-of-the-resource')}</label>
                    <input
                      onChange={setResourceSource}
                      type="text"
                      name="source"
                      placeholder={translate('source-of-the-resource')}
                      value={resourceCandidate.metadata.source} />
                  </div>
                </div>

                <div className="modal-column">
                  <div className="input-group" style={{flex: 1}}>
                    <label htmlFor="description">{translate('description-of-the-resource')}</label>
                    <Textarea
                      onChange={setResourceDescription}
                      type="text"
                      name="description"
                      placeholder={translate('description-of-the-resource')}
                      style={{flex: 1}}
                      value={resourceCandidate.metadata.description} />
                  </div>
                </div>

              </form>
            </section>
          :
          null
        }


      </section>
      <section className="modal-footer">
        {
          resourceCandidate &&
          resourceCandidate.metadata &&
          resourceCandidate.metadata.type &&
          resourceCandidate.data
          ?
            <button
              className="valid-btn"
              onClick={onApplyChange}>{resourceCandidateId ? translate('update-resource') : translate('create-resource')}</button>
          : ''
        }
        <button
          onClick={onClose}>
          {translate('close')}
        </button>
      </section>
    </div>
  );
};


/**
 * Context data used by the component
 */
ResourceConfigurationDialog.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default ResourceConfigurationDialog;
