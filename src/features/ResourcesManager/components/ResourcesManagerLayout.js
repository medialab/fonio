
/**
 * This module exports a stateless component rendering the layout of the resources manager feature interface
 * @module fonio/features/ResourcesManager
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';


import {translateNameSpacer} from '../../../helpers/translateUtils';
import ResourceCard from '../../../components/ResourceCard/ResourceCard';

import ResourceConfigurationDialog from './ResourceConfigurationDialog';
import './ResourcesManagerLayout.scss';

/**
 * Renders the resources manager layout
 * @param {object} props - the props to render
 * @return {ReactElement} markup
 */
const ResourcesManagerLayout = ({
  activeStoryId,
  resourceCandidate,
  resourceCandidateId,
  resourceCandidateType,
  resourceDataLoadingState,
  resources,
  resourcesModalState = 'closed',
  resourcesPrompted,
  resourcesSearchQuery,
  createResource,
  updateResource,
  insertionSelection,
  actions: {
    deleteResource,
    setResourceCandidateMetadataValue,
    setResourceCandidateType,
    setResourcesModalState,
    setResourcesSearchQuery,
    startExistingResourceConfiguration,
    startNewResourceConfiguration,
    submitResourceData,
    unpromptAssetEmbed,
    setEditorFocus,
  },
  // custom functions
  embedAsset,
  // custom props
  style,
}, context) => {
  // namespacing the translation keys with feature id
  const translate = translateNameSpacer(context.t, 'Features.ResourcesManager');

  /**
   * Callbacks
   */
  const onModalClose = () => setResourcesModalState('closed');
  const onSearchInputChange = (e) => {
    setResourcesSearchQuery(e.target.value);
  };
  return (
    <div
      className={'fonio-ResourcesManagerLayout ' + (resourcesPrompted ? 'resources-prompted' : '')}
      style={style}>
      {
        resourcesPrompted && (
          <div className="asset-select-help">
            {resources.length > 0 ?
              <h2>{translate('click-on-a-resource-to-embed')}</h2> :
              <div>
                <h2>{translate('you-must-first-add-resources-to-embed')}</h2>
                <button onClick={unpromptAssetEmbed}>{translate('understood')}</button>
              </div>}
          </div>
        )
      }
      <div className="body">
        <li id="new-resource" onClick={startNewResourceConfiguration}>
          + {translate('new-resource')}
        </li>
        <ul className="resources-list">
          {
          resources.map((resource, index) => {
            const onDelete = () => deleteResource(activeStoryId, resource.id);
            const onEdit = () => startExistingResourceConfiguration(resource.id, resource);
            const onEmbedResource = () => {
              embedAsset(resource.id);
            };
            const onMouseDown = () => {
              setEditorFocus(undefined);
            };
            return (
              <ResourceCard
                key={index}
                onMouseDown={onMouseDown}
                onDelete={onDelete}
                onConfigure={onEdit}
                selectMode={resourcesPrompted}
                onSelect={onEmbedResource}
                style={{cursor: 'move'}}
                {...resource} />
            );
          })
        }
        </ul>
      </div>
      <div className="footer">
        <input
          className="search-query"
          type="text"
          placeholder={translate('search-in-resources')}
          value={resourcesSearchQuery || ''}
          onChange={onSearchInputChange} />
      </div>

      <Modal
        isOpen={resourcesModalState !== 'closed'}
        contentLabel={translate('edit-resource')}
        onRequestClose={onModalClose}>
        <ResourceConfigurationDialog
          resourceCandidate={resourceCandidate}
          resourceCandidateId={resourceCandidateId}
          resourceCandidateType={resourceCandidateType}
          onClose={onModalClose}
          setResourceCandidateType={setResourceCandidateType}
          setResourceCandidateMetadataValue={setResourceCandidateMetadataValue}
          submitResourceData={submitResourceData}
          resourceDataLoadingState={resourceDataLoadingState}
          createResource={createResource}
          updateResource={updateResource} />
      </Modal>
    </div>
  );
};


/**
 * Context data used by the component
 */
ResourcesManagerLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default ResourcesManagerLayout;
