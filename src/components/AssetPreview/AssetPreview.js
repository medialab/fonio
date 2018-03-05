/* eslint react/no-danger : 0 */
/* eslint react/no-set-state : 0 */

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
import {loadResourceData} from '../../helpers/assetsUtils';

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
 * Renders the AssetPreview component as a react component instances
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
class AssetPreview extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: undefined,
      loading: false,
      columns: []
    };
    this.onClickEdit = this.onClickEdit.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);
  }

  componentDidMount() {
    this.updateResource();
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.data !== this.props.data) || nextProps.metadata.lastModifiedAt !== this.props.metadata.lastModifiedAt) {
      console.log("here")
      this.updateResource();
    }
  }

  updateResource() {
    const {data, type} = this.props;
    if (type === 'table' && data && data.url) {
      this.setState({loading: true});
      loadResourceData(data.url)
      .then((result) => {
        const columns = Object.keys(result[0]).map(key => ({
          Header: key,
          accessor: key
        }));
        this.setState({
          data: result,
          loading: false,
          columns
        });
      });
    }

    if (type === 'data-presentation' && data && data.url) {
      loadResourceData(data.url)
      .then((result) => {
        this.setState({
          data: result
        });
      });
    }
  }

  renderPreview() {
    const {type, data, metadata} = this.props;
    const translate = translateNameSpacer(this.context.t, 'Components.AssetPreview');
    switch (type) {
      case 'table':
        let columns;
        if (data.json) {
          columns = Object.keys(data.json[0]).map(key => ({
            Header: key,
            accessor: key
          }));
        }
        return (<ReactTable
          data={data.json || this.state.data}
          columns={columns || this.state.columns}
          loading={this.state.loading}
          previousText={translate('table-previous')}
          nextText={translate('table-next')}
          loadingText={translate('table-loading')}
          noDataText={translate('table-no-rows-found')}
          pageText={translate('table-page')}
          ofText={translate('table-of')}
          rowsText={translate('table-row')} />);
      case 'image':
        return <img key={metadata.lastModifiedAt} src={data.base64 || data.url} />;
      case 'video':
        return (
          <Media>
            <Player src={data.url} />
          </Media>
        );
      case 'data-presentation':
        return (
          (data.json || this.state.data) && <QuinoaPresentationPlayer
            presentation={data.json || this.state.data} />
        );
      case 'webpage':
        return (<iframe src={data} />);
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
  }

  onClickEdit (e) {
    const {onEditRequest} = this.props;
    e.stopPropagation();
    if (typeof onEditRequest === 'function') {
      this.props.onEditRequest();
    }
  }

  onClickDelete (e) {
    const {onEditRequest} = this.props;
    e.stopPropagation();
    if (typeof onEditRequest === 'function') {
      this.props.onDeleteRequest();
    }
  }

  render() {
    const translate = translateNameSpacer(this.context.t, 'Components.AssetPreview');
    const {data, metadata, showPannel} = this.props;
    return (
      <div className="fonio-AssetPreview">
        <div className="preview-container">
          {data && this.renderPreview()}
        </div>
        {showPannel && <div onClick={this.onClickEdit} className="asset-metadata">
          {metadata.title && <h5>{metadata.title}</h5>}
          {metadata.description && <p>{metadata.description}</p>}
          <div>
            <button onClick={this.onClickEdit}>{translate('edit-resource')}</button>
            <button onClick={this.onClickDelete}>{translate('delete-contextualization')}</button>
          </div>
        </div>}
      </div>);
  }
}

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
