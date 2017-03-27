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
  assetsSearchQuery,
  createAsset,
  updateAsset,
  actions: {
    deleteAsset,
    setAssetCandidateMetadataValue,
    setAssetCandidateType,
    setAssetsModalState,
    setAssetsSearchQuery,
    startExistingAssetConfiguration,
    startNewAssetConfiguration,
    submitAssetData,
  },
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.AssetsManager');
  const onModalClose = () => setAssetsModalState('closed');
  const onSearchInputChange = (e) => setAssetsSearchQuery(e.target.value);
  return (
    <div className="fonio-assets-manager-layout">
      <ul className="body">
        {
          assets.map((asset, index) => {
            const onDelete = () => deleteAsset(activeStoryId, asset.id);
            const onEdit = () => startExistingAssetConfiguration(asset.id, asset);
            return (
              <AssetCard
                key={index}
                onDelete={onDelete}
                onConfigure={onEdit}
                {...asset} />
            );
          })
        }
        <li id="new-asset" onClick={startNewAssetConfiguration}>
          + {translate('new-asset')}
        </li>
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
