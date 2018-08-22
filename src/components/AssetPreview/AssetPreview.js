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

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {
  Box,
  Button,
  Content,
  Columns,
  Column,
  Image,
  Level,
  HelpPin,
  Title,
} from 'quinoa-design-library/components';


import QuinoaPresentationPlayer from 'quinoa-presentation-player';
import BibliographicPreview from '../BibliographicPreview';
import {translateNameSpacer} from '../../helpers/translateUtils';
import {loadResourceData} from '../../helpers/assetsUtils';
import {abbrevString} from '../../helpers/misc';


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
      columns: [],
      isInfoShown: false
    };
    this.onClickEdit = this.onClickEdit.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);
  }

  componentDidMount() {
    this.updateResource();
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.resource.data !== this.props.resource.data) || nextProps.resource.lastUpdateAt !== this.props.resource.lastUpdateAt) {
      this.updateResource();
    }
  }

  updateResource() {
    const {resource} = this.props;
    const {getResourceDataUrl} = this.context;
    const {metadata, data} = resource;
    if (metadata.type === 'table' && data && data.filePath) {
      this.setState({loading: true});
      loadResourceData(getResourceDataUrl(data))
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

    if (metadata.type === 'data-presentation' && data && data.filePath) {
      loadResourceData(getResourceDataUrl(data))
      .then((result) => {
        this.setState({
          data: result
        });
      });
    }
  }

  renderPreview() {
    const {resource} = this.props;
    const {data, metadata, lastUpdateAt} = resource;
    const {getResourceDataUrl} = this.context;
    const translate = translateNameSpacer(this.context.t, 'Components.AssetPreview');
    switch (metadata.type) {
      case 'table':
        let columns;
        if (data.json && data.json[0]) {
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
        return (<div className="image-container">
          <img src={data.base64 ? data.base64 : `${getResourceDataUrl(data)}?${lastUpdateAt}`} />
        </div>);
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
        return (<iframe src={data.url} />);
      case 'embed':
        return (
          <EmbedContainer html={data.html} />
        );
      case 'bib':
        if (data.length > 0) {
          const items = data.reduce((result, item) => ({
            ...result,
            [item.id]: item
          }), {});
          return (
            <BibliographicPreview
              items={items} />
          );
        }
        else return null;
      default:
        return null;
    }
  }

  onClickEdit () {
    const {onEditRequest} = this.props;
    if (typeof onEditRequest === 'function') {
      onEditRequest();
    }
  }

  onClickDelete () {
    const {onDeleteRequest} = this.props;
    if (typeof onDeleteRequest === 'function') {
      onDeleteRequest();
    }
  }

  onClickBox (e) {
    e.stopPropagation(); //cause lockingMap state not be updated
  }
  render() {
    const translate = translateNameSpacer(this.context.t, 'Components.AssetPreview');
    const {showPannel, resource} = this.props;
    const {metadata, data} = resource;
    const {isInfoShown} = this.state;
    return (
      showPannel ?
        <Box
          onClick={this.onClickBox}
          style={{background: 'rgb(240,240,240)'}}
          className="fonio-AssetPreview">
          <div className="preview-container">
            {data && this.renderPreview()}
          </div>
          <div>
            <Level />
            <Level>
              <Columns>
                <Column>
                  <Image isSize={'24x24'} className="type-icon" src={icons[metadata.type].black.svg} />
                </Column>
                <Column isSize={11}>
                  <Title isSize={4}>{metadata.title || translate('Unnamed resource')}</Title>
                </Column>
              </Columns>
            </Level>
            <div>
              <div style={{width: '100%'}}>
                <Column style={{paddingLeft: 0, paddingRight: 0}} isSize={12}>
                  <Button
                    isFullWidth style={{overflow: 'visible'}} isColor="warning"
                    onClick={this.onClickDelete}>
                    <span style={{marginRight: '1em'}}>{translate('delete mention')}</span>
                    <HelpPin>
                      {translate(`The ${metadata.type} will not be delete from the library`)}
                    </HelpPin>
                  </Button>
                </Column>
                <Column style={{paddingLeft: 0, paddingRight: 0}} isSize={12}>
                  <Button isFullWidth isColor="primary" onClick={this.onClickEdit}>
                    {translate(`edit ${metadata.type}`)}
                  </Button>
                </Column>
                {/*(metadata.description || metadata.source) && <Column>
                  <Button isColor={isInfoShown ? 'primary' : 'info'} onClick={() => this.setState({isInfoShown: !isInfoShown})}>
                    {translate('show info')}
                  </Button>
                </Column>*/}
              </div>
            </div>
            {(metadata.description || metadata.source) && isInfoShown &&
              <Level>
                <Columns>
                  <Column>
                    {metadata.description &&
                      <div>
                        <Title isSize={5}>{translate('Description')}</Title>
                        <Content>{abbrevString(metadata.description, 500)}</Content>
                      </div>
                    }
                  </Column>
                  {metadata.source &&
                    <Column>
                      <div>
                        <Title isSize={5}>{translate('Source')}</Title>
                        <Content>{abbrevString(metadata.source, 500)}</Content>
                      </div>
                    </Column>
                  }
                </Columns>
              </Level>
            }

          </div>
        </Box> :
        <div className="fonio-AssetPreview">
          <div className="preview-container">
            {data && this.renderPreview()}
          </div>
        </div>
    );
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

  /**
   * getResourceDataUrl in DataUrlProvider
   */
  getResourceDataUrl: PropTypes.func,

};

export default AssetPreview;
