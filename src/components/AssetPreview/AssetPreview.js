/* eslint react/no-danger : 0 */
/**
 * This module provides a asset preview element component
 * @module fonio/components/AssetPreview
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Media, Player} from 'react-media-player';
import QuinoaPresentationPlayer from 'quinoa-presentation-player';
import BibliographicPreview from '../BibliographicPreview/BibliographicPreview';
import {translateNameSpacer} from '../../helpers/translateUtils';

import './AssetPreview.scss';

class EmbedContainer extends Component {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.html !== nextProps.html;
  }

  render() {
    const {
      html
    } = this.props;
    return (<div
      dangerouslySetInnerHTML={{
            __html: html
          }} />);
  }
}

const AssetPreview = ({
  type,
  metadata = {},
  data,
  onEditRequest,
  showPannel = false
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.AssetPreview');
  const onClick = e => {
    e.stopPropagation();
    if (typeof onEditRequest === 'function') {
      onEditRequest();
    }
  };
  const renderPreview = () => {
    switch (type) {
      case 'image':
        return <img src={data.base64} />;
      case 'video':
        return (
          <Media>
            <Player src={data.url} />
          </Media>
        );
      case 'data-presentation':
        return (
          <QuinoaPresentationPlayer
            presentation={data} />
        );
      case 'embed':
        return (
          <EmbedContainer html={data} />
        );
      case 'bib':
        const items = data.reduce((result, item) => ({
          ...result,
          [item.id]: item
        }), {});
        return (
          <BibliographicPreview
            items={items} />
        );
      default:
        return null;
    }
  };
  return (
    <div className="fonio-AssetPreview">
      <div className="preview-container">{renderPreview()}</div>
      {showPannel && <div className="asset-metadata">
        {metadata.title && <h5>{metadata.title}</h5>}
        {metadata.description && <p>{metadata.description}</p>}
        <div>
          <button onClick={onClick}>{translate('edit')}</button>
        </div>
      </div>}
    </div>);
};

AssetPreview.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AssetPreview;
