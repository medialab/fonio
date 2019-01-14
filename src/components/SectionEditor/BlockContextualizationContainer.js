/**
 * This module provides a reusable block contextualization for the editor component
 * @module fonio/components/SectionEditor
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Icon
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { silentEvent } from '../../helpers/misc';

/**
 * Imports Components
 */
import AssetPreview from '../AssetPreview';

/**
 * BlockContainer class for building react component instances
 */
class BlockContainer extends Component {

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
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize here
    return true;
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {

    /**
     * Variables definition
     */
    const {
      asset,
      customContext = {},
    } = this.props;

    const {
      selectedContextualizationId
    } = customContext;

    const {
      startExistingResourceConfiguration,
      deleteContextualizationFromId,
      setSelectedContextualizationId,
      t,
      // selectedContextualizationId,
    } = this.context;

    const {
      resource = {},
      id
    } = asset;

    /**
     * Computed variables
     */
    const isActive = selectedContextualizationId === asset.id;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.BlockContextualization' );

    /**
     * Callbacks handlers
     */
    const handleEditRequest = ( event ) => {
      silentEvent( event );

      if ( typeof startExistingResourceConfiguration === 'function' ) {
        setSelectedContextualizationId( undefined );
        startExistingResourceConfiguration( resource.id );
      }
    };

    const handleDeleteRequest = ( event ) => {
      silentEvent( event );
      if ( typeof startExistingResourceConfiguration === 'function' ) {
        deleteContextualizationFromId( id );
      }
    };

    const handleClickOnPreview = ( event ) => {
      if ( event ) {
        silentEvent( event );
      }
      if ( /*!['video', 'table', 'embed'].includes(type) &&*/ typeof setSelectedContextualizationId === 'function' ) {
        if ( selectedContextualizationId === asset.id ) {
          setSelectedContextualizationId( undefined );
        }
        else {
          setSelectedContextualizationId( asset.id );
        }
      }
    };

    return ( resource.data ?
      [
        <div
          contentEditable={ false }
          className={ `block-asset-side-toolbar ${isActive ? 'is-active' : ''}` }
          key={ 0 }
        >
          <Button
            isRounded
            isColor={ 'danger' }
            onClick={ handleDeleteRequest }
            data-for={ 'tooltip' }
            data-place={ 'right' }
            data-effect={ 'solid' }
            data-tip={ translate( `delete mention (the ${resource.metadata.type} will not be delete from the library)` ) }
          >
            <Icon>
              <FontAwesomeIcon icon={faTrash} />
            </Icon>
          </Button>
          <Button
            isRounded
            onClick={ handleEditRequest }
            data-for={ 'tooltip' }
            data-place={ 'right' }
            data-effect={ 'solid' }
            data-tip={ translate( `edit ${resource.metadata.type}` ) }
          >
            <Icon>
              <img src={ icons.settings.black.svg } />
            </Icon>
          </Button>
        </div>,
        <AssetPreview
          key={ 1 }
          resource={ resource }
          handleEditRequest={ handleEditRequest }
          onDeleteRequest={ handleDeleteRequest }
          style={ { cursor: 'pointer' } }
          isActive={ isActive }
          onClick={ handleClickOnPreview }
          showPannel
        />

      ] : null
      );
  }
}

/**
 * Component's properties types
 */
BlockContainer.propTypes = {

  /*
   * the asset to render
   */
  asset: PropTypes.shape( {
    resource: PropTypes.object,
  } )
};

/**
 * Component's context used properties
 */
BlockContainer.contextTypes = {

  /**
   * Callbacks when resource configuration is asked from
   * within the asset component
   */
  startExistingResourceConfiguration: PropTypes.func,
  deleteContextualizationFromId: PropTypes.func,
  setSelectedContextualizationId: PropTypes.func,
  selectedContextualizationId: PropTypes.string,
  t: PropTypes.func,
};
export default BlockContainer;
