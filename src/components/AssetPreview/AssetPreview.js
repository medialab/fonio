/* eslint react/no-danger : 0 */
/**
 * This module provides a asset preview element component
 * @module fonio/components/AssetPreview
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Media, Player} from 'react-media-player';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

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
      case 'table':
        const columns = Object.keys(data[0]).map(key => ({
          Header: key,
          accessor: key
        }))
        return <ReactTable 
                  data={data} 
                  columns={columns} 
                  previousText={translate('table-previous')}
                  nextText={translate('table-next')}
                  loadingText={translate('table-loading')}
                  noDataText={translate('table-no-rows-found')} 
                  pageText={translate('table-page')}
                  ofText={translate('table-of')}
                  rowsText={translate('table-row')}
                />;
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
      {showPannel && <div onClick={onClick} className="asset-metadata">
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
