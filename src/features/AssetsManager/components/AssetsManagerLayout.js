/**
 * This module exports a stateless component rendering the layout of the assets manager feature interface
 * @module fonio/features/AssetsManager
 */
import React, {PropTypes} from 'react';
import Modal from 'react-modal';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import AssetCard from '../../../components/AssetCard/AssetCard';

import AssetConfigurationDialog from './AssetConfigurationDialog';
import './AssetsManager.scss';
/**
 * Renders the assets manager layout
 * @param {object} props - the props to render
 * @return {ReactElement} markup
 */
const AssetsManagerLayout = ({
  activeStoryId,
  assetCandidate,
  assetCandidateId,
  assetCandidateType,
  assetDataLoadingState,
  assets,
  assetsModalState = 'closed',
  assetsPrompted,
  assetsSearchQuery,
  createAsset,
  updateAsset,
  insertionSelection,
  actions: {
    deleteAsset,
    setAssetCandidateMetadataValue,
    setAssetCandidateType,
    setAssetsModalState,
    setAssetsSearchQuery,
    startExistingAssetConfiguration,
    startNewAssetConfiguration,
    submitAssetData,
    unpromptAssetEmbed,
    embedAsset
  },
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.AssetsManager');
  const onModalClose = () => setAssetsModalState('closed');
  const onSearchInputChange = (e) => setAssetsSearchQuery(e.target.value);
  return (
    <div className={'fonio-assets-manager-layout' + (assetsPrompted ? ' assets-prompted' : '')}>
      {
        assetsPrompted && (
          assets.length > 0 ?
            <h2>Choose an asset to embed in your story</h2> :
            <div>
              <h2>You must first add assets to your library to be able to embed them inside your story</h2>
              <button onClick={unpromptAssetEmbed}>Got it</button>
            </div>
        )
      }
      <ul className="body">
        {
          assets.map((asset, index) => {
            const onDelete = () => deleteAsset(activeStoryId, asset.id);
            const onEdit = () => startExistingAssetConfiguration(asset.id, asset);
            const onEmbedAsset = (metadata) => {
              embedAsset(activeStoryId, asset.id, metadata, insertionSelection);
            };
            return (
              <AssetCard
                key={index}
                onDelete={onDelete}
                onConfigure={onEdit}
                selectMode={assetsPrompted}
                onSelect={onEmbedAsset}
                style={{cursor: 'move'}}
                {...asset} />
            );
          })
        }
        {
          !assetsPrompted && (
            <li id="new-asset" onClick={startNewAssetConfiguration}>
              + {translate('new-asset')}
            </li>
          )
        }
      </ul>
      <div className="footer">
        <input
          className="search-query"
          type="text"
          placeholder={translate('search-in-assets')}
          value={assetsSearchQuery}
          onChange={onSearchInputChange} />
      </div>

      <Modal
        isOpen={assetsModalState !== 'closed'}
        contentLabel={translate('edit-asset')}
        onRequestClose={onModalClose}>
        <AssetConfigurationDialog
          assetCandidate={assetCandidate}
          assetCandidateId={assetCandidateId}
          assetCandidateType={assetCandidateType}
          onClose={onModalClose}
          setAssetCandidateType={setAssetCandidateType}
          setAssetCandidateMetadataValue={setAssetCandidateMetadataValue}
          submitAssetData={submitAssetData}
          assetDataLoadingState={assetDataLoadingState}
          createAsset={createAsset}
          updateAsset={updateAsset} />
      </Modal>
    </div>
  );
};

AssetsManagerLayout.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AssetsManagerLayout;
