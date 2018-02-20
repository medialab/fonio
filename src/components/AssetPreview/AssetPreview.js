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


/**
 * EmbedContainer class for building react component instances
 * that wrap an embed/iframe element
 * (it is just aimed at preventing intempestuous reloading of embed code)
 */
class EmbedContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
  }


  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate(nextProps) {
    return this.props.html !== nextProps.html;
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
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


/**
 * Component's properties types
 */
EmbedContainer.propTypes = {

  /**
   * Raw html code to embed
   */
  html: PropTypes.string,
};


/**
 * Renders the AssetPreview component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
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


  /**
   * Builds the appropriate preview against asset type
   * @return {ReactElement} component - appropriate component
   */
  const renderPreview = () => {
    switch (type) {
      case 'table':
        const columns = Object.keys(data[0]).map(key => ({
          Header: key,
          accessor: key
        }));
        return (<ReactTable
          data={data}
          columns={columns}
          previousText={translate('table-previous')}
          nextText={translate('table-next')}
          loadingText={translate('table-loading')}
          noDataText={translate('table-no-rows-found')}
          pageText={translate('table-page')}
          ofText={translate('table-of')}
          rowsText={translate('table-row')} />);
      case 'image':
        return <img src={data.base64 || data.url} />;
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
      <div className="preview-container">
        {data && renderPreview()}
      </div>
      {showPannel && <div onClick={onClick} className="asset-metadata">
        {metadata.title && <h5>{metadata.title}</h5>}
        {metadata.description && <p>{metadata.description}</p>}
        <div>
          <button onClick={onClick}>{translate('edit')}</button>
        </div>
      </div>}
    </div>);
};


/**
 * Component's properties types
 */
AssetPreview.propTypes = {

  /**
   * Type of the asset
   */
  type: PropTypes.string,

  /**
   * Metadata of the asset
   */
  metadata: PropTypes.object,

  /**
   * Data of the asset
   */
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),

  /**
   * Whether to show the pannel displaying asset metadata
   */
  showPannel: PropTypes.bool,

  /**
   * Callbacks when asset is asked for edition from component
   */
  onEditRequest: PropTypes.func,
};


/**
 * Component's context used properties
 */
AssetPreview.contextTypes = {

  /**
   * translation function
   */
  t: PropTypes.func.isRequired,
};

export default AssetPreview;
