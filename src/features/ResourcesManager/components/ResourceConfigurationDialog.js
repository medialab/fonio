/**
 * This module exports a stateless dialog component for editing a resource
 * @module fonio/features/ResourcesManager
 */

import React from 'react';
import PropTypes from 'prop-types';

import Textarea from 'react-textarea-autosize';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import BigSelect from '../../../components/BigSelect/BigSelect';
import HelpPin from '../../../components/HelpPin/HelpPin';
import Toaster from '../../../components/Toaster/Toaster';
import DropZone from '../../../components/DropZone/DropZone';
import AssetPreview from '../../../components/AssetPreview/AssetPreview';
// import BibRefsEditor from '../../../components/BibRefsEditor/BibRefsEditor';

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
  setResourceCandidateMetadataValue,
  resourceCandidate
}, context) => {
  // namespacing the translation keys with feature id
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  const setResourceDescription = (e) => setResourceCandidateMetadataValue('description', e.target.value);
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
      const onVideoUrlSubmit = (e) => {
        submitResourceData('videoUrl', e.target.value);
        setResourceCandidateMetadataValue('videoUrl', e.target.value);
      };
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

      return (
        <div className="data-presentation-input">
          <DropZone
            onDrop={onPresentationSubmit}>
            <div>
              <p>{translate('drop-a-file-here')}</p>
            </div>
          </DropZone>
        </div>
      );
    case 'bib':
      const onBibTeXFileSubmit = (files) => submitResourceData('bibTeXFile', files[0]);

      // const onRefsChange = refs => {
      //   submitResourceData('cslJSON', refs);
      // };
      return (
        <div>
          <DropZone
            onDrop={onBibTeXFileSubmit}>
            <div>
              <p>{translate('drop-bibtex-here')}</p>
            </div>
          </DropZone>
          {/*<BibRefsEditor
            references={resourceCandidate.data}
            onChange={onRefsChange} />*/}
        </div>
      );
    case 'webpage':
      const onWebpageSubmit = (evt) => submitResourceData('webpageUrl', evt.target.value);
      const onWebpageTitleSubmit = (evt) => setResourceCandidateMetadataValue('title', evt.target.value);
      return (
        <div className="input-group">
          <label>
            {translate('webpage-name')}
          </label>
          <input
            onChange={onWebpageTitleSubmit}
            type="text"
            name="webpage"
            placeholder={translate('webpage-name')}
            style={{flex: 1, width: '100%'}}
            value={resourceCandidate.metadata.title || ''} />
          <label>
            {translate('webpage-url')}
          </label>
          <input
            onChange={onWebpageSubmit}
            type="text"
            name="webpage"
            placeholder={translate('paste-webpage-url')}
            style={{flex: 1, width: '100%'}}
            value={resourceCandidate.data || ''} />
        </div>
      );
    case 'embed':
      const onEmbedSubmit = (evt) => submitResourceData('htmlCode', evt.target.value);
      return (
        <div className="input-group">
          <label>
            {translate('embed-code')}
          </label>
          <Textarea
            onChange={onEmbedSubmit}
            type="text"
            name="description"
            placeholder={translate('paste-embed-code')}
            style={{flex: 1, width: '100%'}}
            value={resourceCandidate.data || ''} />
        </div>
      );
    case 'glossary':
      const onNameChange = e => submitResourceData('glossaryName', e.target.value, resourceCandidate.data);
      // const onTypeChange = value => submitResourceData('glossaryType', value, resourceCandidate.data);
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
            <label htmlFor="description">{translate('description-of-the-glossary-entry')}</label>
            <Textarea
              onChange={setResourceDescription}
              type="text"
              name="description"
              placeholder={translate('description-of-the-resource')}
              value={resourceCandidate.metadata.description} />
          </div>
          {/*<div className="input-group">
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
          </div>*/}
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
  embedLastResource,
  onClose,
  createResource,
  updateResource,
  contextualizeAfterResourceCreation,
}, context) => {
  // namespacing the translate function with the feature name
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  // todo: this should be stored elsewhere
  const resourcesTypes = [
    // {
    //   id: 'data-presentation',
    //   icon: require('../../../sharedAssets/data-presentation-black.svg'),
    //   label: (<span>{translate('resource-type-data-presentation')} <HelpPin>
    //     {translate('resource-type-data-presentation-help')}
    //   </HelpPin></span>),
    //   possible: true
    // },
    {
      id: 'webpage',
      icon: require('../../../sharedAssets/webpage-black.svg'),
      label: (<span>{translate('resource-type-webpage')}<br /> <HelpPin position="right">
        {translate('resource-type-webpage-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'glossary',
      icon: require('../../../sharedAssets/glossary-black.svg'),
      label: (<span>{translate('resource-type-glossary')}<br /> <HelpPin position="left">
        {translate('resource-type-glossary-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'bib',
      icon: require('../../../sharedAssets/bib-black.svg'),
      label: (<span>{translate('resource-type-bib')}<br /> <HelpPin position="left">
        {translate('resource-type-bib-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'table',
      icon: require('../../../sharedAssets/table-black.svg'),
      label: (<span>{translate('resource-type-table')}<br /> <HelpPin>
        {translate('resource-type-table-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'image',
      icon: require('../../../sharedAssets/image-black.svg'),
      label: (<span>{translate('resource-type-image')}<br /> <HelpPin>
        {translate('resource-type-image-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'video',
      icon: require('../../../sharedAssets/video-black.svg'),
      label: (<span>{translate('resource-type-video')}<br /> <HelpPin>
        {translate('resource-type-video-help')}
      </HelpPin></span>),
      possible: true
    },
    {
      id: 'embed',
      icon: require('../../../sharedAssets/embed-black.svg'),
      label: (<span>{translate('resource-type-embed')}<br /> <HelpPin position="left">
        {translate('resource-type-embed-help')}
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

      if (contextualizeAfterResourceCreation) {
        setTimeout(() => {
          embedLastResource();
        });
      }
    }
  };
  const onResourceTypeSelect = (resource) => setResourceCandidateType(resource.id);
  const setResourceTitle = (e) => setResourceCandidateMetadataValue('title', e.target.value);
  const setResourceDescription = (e) => setResourceCandidateMetadataValue('description', e.target.value);
  const setResourceSource = (e) => setResourceCandidateMetadataValue('source', e.target.value);

  const generateHeaderTitle = type => {
    switch (type) {
      case 'webpage':
        return translate('edit-webpage');
      case 'glossary':
        return translate('edit-glossary');
      case 'bib':
        return translate('edit-bib');
      case 'video':
        return translate('edit-video');
      case 'table':
        return translate('edit-table');
      case 'image':
        return translate('edit-image');
      case 'embed':
        return translate('edit-embed');
      case 'data-presentation':
        return translate('edit-data-presentation');
      default:
        return translate('edit-resource');
    }
  }
  const generateFooterTitle = type => {
    switch (type) {
      case 'webpage':
        return translate('update-webpage');
      case 'glossary':
        return translate('update-glossary');
      case 'bib':
        return translate('update-bib');
      case 'video':
        return translate('update-video');
      case 'table':
        return translate('update-table');
      case 'image':
        return translate('update-image');
      case 'embed':
        return translate('update-embed');
      case 'data-presentation':
        return translate('update-data-presentation');
      default:
        return translate('update-resource');
    }
  }
  return (
    <div className="fonio-resource-configuration-dialog">
      <h1 className="modal-header">
        <span className="modal-header-title">{resourceCandidateId ? generateHeaderTitle(resourceCandidateType) : translate('create-resource')}</span>
        <button className="close-btn" onClick={onClose}>
          <img src={require('../../../sharedAssets/cancel-white.svg')} />
        </button>
      </h1>
      <section className="modal-content">
        {resourceCandidateId === undefined ?
          <section className="modal-row no-bg">
            <BigSelect
              options={resourcesTypes}
              activeOptionId={resourceCandidateType}
              onOptionSelect={onResourceTypeSelect} />
          </section> : null}
        {resourceCandidateType ?
          <section className="modal-row">
            {/*<h2>{translate('resource-data')}
              <HelpPin>
                {translate('resource-data-help')}
              </HelpPin>
            </h2>*/}
            <div className="data-row">
              <div className="modal-column">
                <ResourceDataInput
                  type={resourceCandidateType}
                  resourceCandidate={resourceCandidate}
                  setResourceCandidateMetadataValue={setResourceCandidateMetadataValue}
                  submitResourceData={submitResourceData} />
                {
                  resourceCandidateType !== 'glossary' &&
                  resourceCandidateType !== 'webpage' &&
                  resourceCandidateType !== 'embed' &&
                  <LoadingStateToaster loadingState={resourceDataLoadingState} type={'loading'} />
                }
                {
                  resourceCandidateType !== 'glossary' &&
                  resourceCandidateType !== 'webpage' &&
                  resourceCandidateType !== 'embed' &&
                  resourceCandidateType !== 'bib' &&
                  resourceCandidateType !== 'video' &&
                  <LoadingStateToaster loadingState={resourceUploadingState} type={'uploading'} />
                }

              </div>
              {
                resourceCandidate.data
                && resourceCandidate.metadata.type !== 'glossary'
                && resourceCandidate.metadata.type !== 'webpage' ?
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
            resourceCandidateType !== 'webpage' &&
            resourceCandidateType !== 'glossary' &&
            resourceCandidateType !== 'bib'
          ) ?
            <section className="modal-row">
              {/*<h2>{translate('resource-metadata')}
                <HelpPin>
                  {translate('resource-metadata-help')}
                </HelpPin>
              </h2>*/}
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
      {
          resourceCandidate &&
          resourceCandidate.metadata &&
          resourceCandidate.metadata.type &&
          resourceCandidate.data
          ?
            <section className="modal-footer">

              <button
                className="valid-btn"
                onClick={onApplyChange}>{resourceCandidateId ? generateFooterTitle(resourceCandidateType) : translate('create-resource')}</button>
            </section>
      : null
        }
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
