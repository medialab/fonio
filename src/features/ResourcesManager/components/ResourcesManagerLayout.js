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
  },
  // custom functions
  embedAsset,
  // custom props
  style,
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.ResourcesManager');
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
          resources.length > 0 ?
            <h2>Click or drag a resource to embed in your story</h2> :
            <div>
              <h2>You must first add resources to your library to be able to embed them inside your story</h2>
              <button onClick={unpromptAssetEmbed}>Got it</button>
            </div>
        )
      }
      <div className="body">
        {
        !resourcesPrompted &&
          <li id="new-resource" onClick={startNewResourceConfiguration}>
            + {translate('new-resource')}
          </li>
        }
        <ul className="resources-list">
          {
          resources.map((resource, index) => {
            const onDelete = () => deleteResource(activeStoryId, resource.id);
            const onEdit = () => startExistingResourceConfiguration(resource.id, resource);
            const onEmbedResource = () => {
              embedAsset(resource.id);
            };
            return (
              <ResourceCard
                key={index}
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

ResourcesManagerLayout.contextTypes = {
  t: PropTypes.func.isRequired
};

export default ResourcesManagerLayout;
