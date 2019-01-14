/**
 * This module provides a asset preview element component
 * @module fonio/components/AssetPreview
 */
/* eslint react/no-danger : 0 */
/* eslint react/no-set-state : 0 */

/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Player from 'react-player';
import ReactTable from 'react-table';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import {
  Box,
  Column,
  Columns,
  Content,
  Image,
  Level,
  Title,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { loadResourceData } from '../../helpers/assetsUtils';
import { abbrevString, silentEvent } from '../../helpers/misc';

/**
 * Imports Components
 */
// import QuinoaPresentationPlayer from 'quinoa-presentation-player';
import BibliographicPreview from '../BibliographicPreview';

/**
 * Imports Assets
 */
import 'react-table/react-table.css';
import './AssetPreview.scss';

/**
 * Shared constants
 */
const LONG_TEXT_MAX_LENGTH = 500;

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
  constructor( props ) {
    super( props );
  }

  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate( nextProps ) {
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
    return (
      <div
        style={ { background: '#FFF' } }
        dangerouslySetInnerHTML={ {
              __html: html
            } }
      />
    );
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

  constructor( props ) {
    super( props );
    this.state = {
      data: undefined,
      loading: false,
      columns: [],
      isInfoShown: false
    };
    this.onClickEdit = this.onClickEdit.bind( this );
    this.onClickDelete = this.onClickDelete.bind( this );
  }

  componentDidMount() {
    this.updateResource();
  }

  componentWillReceiveProps( nextProps ) {
    if ( ( nextProps.resource.data !== this.props.resource.data ) || nextProps.resource.lastUpdateAt !== this.props.resource.lastUpdateAt ) {
      this.updateResource();
    }
  }

  updateResource() {
    const { resource } = this.props;
    const { getResourceDataUrl } = this.context;
    const { metadata, data } = resource;
    if ( metadata.type === 'table' && data && data.filePath ) {
      this.setState( { loading: true } );
      loadResourceData( getResourceDataUrl( data ) )
      .then( ( result ) => {
        const columns = Object.keys( result[0] ).map( ( key ) => ( {
          Header: key,
          accessor: key
        } ) );
        this.setState( {
          data: result,
          loading: false,
          columns
        } );
      } );
    }

    if ( metadata.type === 'data-presentation' && data && data.filePath ) {
      loadResourceData( getResourceDataUrl( data ) )
      .then( ( result ) => {
        this.setState( {
          data: result
        } );
      } );
    }
  }

  renderPreview() {
    const { resource } = this.props;
    const { data, metadata, lastUpdateAt } = resource;
    const { getResourceDataUrl } = this.context;
    const translate = translateNameSpacer( this.context.t, 'Components.AssetPreview' );
    switch ( metadata.type ) {
      case 'table':
        let columns;
        const usableData = data.json || this.state.data;
        if ( usableData && usableData[0] ) {
          columns = Object.keys( usableData[0] )
          .filter(key => key.trim().length)
          .map( ( key ) => ( {
            Header: key,
            accessor: key
          } ) );
        }
        return (
          <ReactTable
            data={ usableData }
            columns={ columns || this.state.columns }
            loading={ this.state.loading }
            previousText={ translate( 'table-previous' ) }
            nextText={ translate( 'table-next' ) }
            loadingText={ translate( 'table-loading' ) }
            noDataText={ translate( 'table-no-rows-found' ) }
            pageText={ translate( 'table-page' ) }
            ofText={ translate( 'table-of' ) }
            rowsText={ translate( 'table-row' ) }
          />
        );
      case 'image':
        return (
          <div className={ 'image-container' }>
            <img src={ data.base64 ? data.base64 : `${getResourceDataUrl( data )}?${lastUpdateAt}` } />
          </div>
        );
      case 'video':
        return (
          <div className={ 'player-container' }><Player url={ data.url } /></div>
        );

      /*
       * case 'data-presentation':
       *   return (
       *     (data.json || this.state.data) && <QuinoaPresentationPlayer
       *       presentation={data.json || this.state.data} />
       *   );
       */
      case 'webpage':
        return ( <iframe src={ data.url } /> );
      case 'embed':
        return (
          <EmbedContainer html={ data.html } />
        );
      case 'bib':
        if ( data.length > 0 ) {
          const items = data.reduce( ( result, item ) => ( {
            ...result,
            [item.id]: item
          } ), {} );
          return (
            <BibliographicPreview
              items={ items }
            />
          );
        }
        else return null;
      default:
        return null;
    }
  }

  onClickEdit () {
    const { onEditRequest } = this.props;
    if ( typeof onEditRequest === 'function' ) {
      onEditRequest();
    }
  }

  onClickDelete () {
    const { onDeleteRequest } = this.props;
    if ( typeof onDeleteRequest === 'function' ) {
      onDeleteRequest();
    }
  }

  onClickBox = ( e ) => {
    silentEvent( e ); //cause lockingMap state not be updated
    if ( typeof this.props.onClick === 'function' ) {
      this.props.onClick( e );
    }
  }
  render() {

    /**
     * Variables definition
     */
    const {
      showPannel,
      resource,
      style = {},
      isActive,
      silentPreviewClick = true,
    } = this.props;
    const { metadata, data } = resource;
    const { isInfoShown } = this.state;

    /**
     * Computed variables
     */
    const handleClickBox = this.onClickBox;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( this.context.t, 'Components.AssetPreview' );

    /**
     * Callbacks handlers
     */
    const handlePreviewClick = ( event ) => {
      if ( silentPreviewClick ) {
        silentEvent( event );
      }
    };

    return (
      showPannel ?
        <Box
          onClick={ handleClickBox }
          style={ {
            background: isActive ? '#3F51B5' : 'rgb(240,240,240)',
            color: isActive ? '#FFF' : '#333',
            padding: 0,
            paddingBottom: '.3rem',
            ...style,
          } }
          className={ 'fonio-AssetPreview' }
        >
          <div className={ 'preview-container' }>
            {data && this.renderPreview()}
          </div>
          <div>
            <Level style={ { margin: '1rem', marginBottom: 0 } }>
              <Columns isMobile>
                <Column isSize={ 1 }>
                  <Image
                    isSize={ '24x24' }
                    className={ 'type-icon' }
                    src={ icons[metadata.type].black.svg }
                  />
                </Column>
                <Column isSize={ 11 }>
                  <Title
                    style={ { paddingTop: '.2rem', color: 'inherit' } }
                    isSize={ 6 }
                  >{metadata.title || translate( 'Unnamed resource' )}
                  </Title>
                </Column>
              </Columns>
            </Level>
            {
              ( metadata.description || metadata.source ) && isInfoShown &&
              <Level>
                <Columns>
                  <Column>
                    {metadata.description &&
                      <div>
                        <Title isSize={ 5 }>{translate( 'Description' )}</Title>
                        <Content>{abbrevString( metadata.description, LONG_TEXT_MAX_LENGTH )}</Content>
                      </div>
                    }
                  </Column>
                  {
                    metadata.source &&
                    <Column>
                      <div>
                        <Title isSize={ 5 }>{translate( 'Source' )}</Title>
                        <Content>{abbrevString( metadata.source, LONG_TEXT_MAX_LENGTH )}</Content>
                      </div>
                    </Column>
                  }
                </Columns>
              </Level>
            }

          </div>
        </Box> :
        <div className={ 'fonio-AssetPreview' }>
          <div
            onClick={ handlePreviewClick }
            className={ 'preview-container' }
          >
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
   * Data of the asset
   */
  data: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array, PropTypes.string ] ),

  /**
   * Metadata of the asset
   */
  metadata: PropTypes.object,

  /**
   * Callbacks when asset is asked for edition from component
   */
  onEditRequest: PropTypes.func,

  /**
   * Whether to show the pannel displaying asset metadata
   */
  showPannel: PropTypes.bool,

  /**
   * Type of the asset
   */
  type: PropTypes.string,
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
