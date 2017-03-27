import React, {PropTypes} from 'react';

import Textarea from 'react-textarea-autosize';


import {translateNameSpacer} from '../../../helpers/translateUtils';

import BigSelect from '../../../components/BigSelect/BigSelect';
import HelpPin from '../../../components/HelpPin/HelpPin';
import Toaster from '../../../components/Toaster/Toaster';
import DropZone from '../../../components/DropZone/DropZone';
import AssetPreview from '../../../components/AssetPreview/AssetPreview';

import './AssetConfigurationDialog.scss';


const AssetDataInput = ({
  type,
  submitAssetData,
  assetCandidate
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  switch (type) {
    case 'media':
      const onVideoUrlSubmit = (e) => submitAssetData('mediaUrl', e.target.value);
      return (
        <div className="input-group">
          <label htmlFor="title">{translate('url-of-the-media')}</label>
          <input
            onChange={onVideoUrlSubmit}
            type="text"
            name="url"
            placeholder={translate('url-of-the-media')}
            value={assetCandidate.metadata.mediaUrl} />
        </div>
      );
    case 'image':
      const onImageSubmit = (files) => submitAssetData('imageFile', files[0]);
      return (
        <DropZone
          onDrop={onImageSubmit}>
          <div>
            <p>{translate('drop-a-file-here')}</p>
          </div>
        </DropZone>
      );
    case 'data-presentation':
      const onPresentationSubmit = (files) => submitAssetData('dataPresentationFile', files[0]);
      return (
        <DropZone
          onDrop={onPresentationSubmit}>
          <div>
            <p>{translate('drop-a-file-here')}</p>
          </div>
        </DropZone>
      );
    default:
      return null;
  }
};
AssetDataInput.contextTypes = {
  t: PropTypes.func.isRequired
};

const LoadingStateToaster = ({
  loadingState
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  let log;
  switch (loadingState) {
    case 'processing':
      log = translate('loading-asset-data');
      break;
    case 'success':
      log = translate('loading-asset-data-success');
      break;
    case 'fail':
      log = translate('loading-asset-data-fail');
      break;
    default:
      break;
  }
  return <Toaster status={loadingState} log={log} />;
};
LoadingStateToaster.contextTypes = {
  t: PropTypes.func.isRequired
};

const AssetConfigurationDialog = ({
  assetCandidate,
  assetCandidateId,
  assetCandidateType,
  setAssetCandidateType,
  assetDataLoadingState,
  setAssetCandidateMetadataValue,
  submitAssetData,
  onClose,
  createAsset,
  updateAsset
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.Editor');

  const assetsTypes = [
  {
    id: 'image',
    icon: require('../assets/image.svg'),
    label: (<span>{translate('asset-type-image')} <HelpPin>
      {translate('asset-type-image-help')}
    </HelpPin></span>),
    possible: true
  },
  {
    id: 'media',
    icon: require('../assets/media.svg'),
    label: (<span>{translate('asset-type-media')} <HelpPin>
      {translate('asset-type-media-help')}
    </HelpPin></span>),
    possible: true
  }, {
    id: 'data-presentation',
    icon: require('../assets/data-presentation.svg'),
    label: (<span>{translate('asset-type-data-presentation')} <HelpPin position="left">
      {translate('asset-type-data-presentation-help')}
    </HelpPin></span>),
    possible: true
  }
  ];
  const onApplyChange = () => {
    if (assetCandidateId) {
      updateAsset(assetCandidateId, assetCandidate);
    }
  else {
      createAsset(assetCandidate);
    }
  };
  const onAssetTypeSelect = (asset) => setAssetCandidateType(asset.id);
  const setAssetTitle = (e) => setAssetCandidateMetadataValue('title', e.target.value);
  const setAssetDescription = (e) => setAssetCandidateMetadataValue('description', e.target.value);
  const setAssetSource = (e) => setAssetCandidateMetadataValue('source', e.target.value);
  return (
    <div className="fonio-asset-configuration-dialog">
      <h1 className="modal-header">
        {assetCandidateId ? translate('edit-asset') : translate('create-asset')}
      </h1>
      <section className="modal-content">
        {assetCandidateId === undefined ?
          <section className="modal-row">
            <BigSelect
              options={assetsTypes}
              activeOptionId={assetCandidateType}
              onOptionSelect={onAssetTypeSelect} />
          </section> : null}
        {assetCandidateType ?
          <section className="modal-row">
            <h2>{translate('asset-data')}
              <HelpPin>
                {translate('asset-data-help')}
              </HelpPin>
            </h2>
            <div className="data-row">
              <div className="modal-column">
                <AssetDataInput
                  type={assetCandidateType}
                  assetCandidate={assetCandidate}
                  submitAssetData={submitAssetData} />
                <LoadingStateToaster loadingState={assetDataLoadingState} />
              </div>
              {
                assetCandidate.data ?
                (<div className="modal-column preview-container">
                  <AssetPreview
                    type={assetCandidateType}
                    data={assetCandidate.data} />
                </div>)
                : null
              }
            </div>
          </section>
          : null}

        {assetCandidateType ?
          <section className="modal-row">
            <h2>{translate('asset-metadata')}
              <HelpPin>
                {translate('asset-metadata-help')}
              </HelpPin>
            </h2>
            <form className="modal-columns-container">
              <div className="modal-column">
                <div className="input-group">
                  <label htmlFor="title">{translate('title-of-the-asset')}</label>
                  <input
                    onChange={setAssetTitle}
                    type="text"
                    name="title"
                    placeholder={translate('title-of-the-asset')}
                    value={assetCandidate.metadata.title} />
                </div>

                <div className="input-group">
                  <label htmlFor="source">{translate('source-of-the-asset')}</label>
                  <input
                    onChange={setAssetSource}
                    type="text"
                    name="source"
                    placeholder={translate('source-of-the-asset')}
                    value={assetCandidate.metadata.source} />
                </div>
              </div>

              <div className="modal-column">
                <div className="input-group" style={{flex: 1}}>
                  <label htmlFor="description">{translate('description-of-the-asset')}</label>
                  <Textarea
                    onChange={setAssetDescription}
                    type="text"
                    name="description"
                    placeholder={translate('description-of-the-asset')}
                    style={{flex: 1}}
                    value={assetCandidate.metadata.description} />
                </div>
              </div>
            </form>
          </section> : null}
      </section>
      <section className="modal-footer">
        {
          assetCandidate &&
          assetCandidate.metadata &&
          assetCandidate.metadata.type &&
          assetCandidate.data
          ?
            <button
              className="valid-btn"
              onClick={onApplyChange}>{assetCandidateId ? translate('update-asset') : translate('create-asset')}</button>
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

AssetConfigurationDialog.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AssetConfigurationDialog;
