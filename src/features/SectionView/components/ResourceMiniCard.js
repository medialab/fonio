/* eslint react/no-set-state : 0 */
/* eslint react/no-danger : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import {
  Button,
  Card,
  Column,
  Columns,
  Icon,
  StatusMarker,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  abbrevString,
  silentEvent
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import MovePad from '../../../components/MovePad';

/**
 * Imports Assets
 */
import './ResourceMiniCard.scss';

/**
 * react-dnd drag & drop handlers
 */

/**
 * drag source handler
 */
const resourceSource = {
  beginDrag( props ) {
    return {
      id: props.sectionKey,
      index: props.sectionIndex
    };
  }
};

/**
 * dnd-related decorators for the ResourceCard component
 */
@DragSource( 'RESOURCE', resourceSource, ( connect, monitor ) => ( {
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
} ) )

/**
 * ResourceCard class for building react component instances
 */
class ResourceCard extends Component {

  /**
   * Component's context used properties
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: PropTypes.func.isRequired,
    setDraggedResourceId: PropTypes.func,
    getResourceDataUrl: PropTypes.func
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
    this.state = {
      moved: undefined
    };
  }

  componentDidMount() {

    /*
     * const {connectDragPreview} = this.props;
     * console.log('connect preview');
     * connectDragPreview(<div>preview</div>);
     */
    const {
      connectDragPreview,
      resource = {}
    } = this.props;
    const { metadata = {} } = resource;
    const { type = 'bib' } = metadata;
    const img = new Image();
    img.src = icons[type].black.svg;
    img.onload = () =>
      connectDragPreview( img );
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
      props,
      context: {
        t,
        setDraggedResourceId,
        getResourceDataUrl
      }
    } = this;
    const {
      resource = {},
      lockData,
      isActive,
      onEdit,
      onDelete,
      getTitle,
      onSetCoverImage,
      selectMode,
      coverImageId,

      connectDragSource,
      onMouseDown,
    } = props;

     const {
        data,
        metadata = {}
      } = resource;

      const {
        type,
      } = metadata;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.SectionView' );

    /**
     * Computed variables
     */
    let lockStatus;
    let lockMessage;
    if ( isActive ) {
      lockStatus = 'active';
      lockMessage = translate( 'edited by you' );
    }
    else if ( lockData ) {
      lockStatus = 'locked';
      lockMessage = translate( 'edited by {a}', { a: lockData.name } );
    }
    else {
      lockStatus = 'open';
      lockMessage = translate( 'open to edition' );
    }

    let resourceTitle;
    if ( type === 'bib' && data && data[0] ) {
      resourceTitle = ( <div
        data-for={ 'tooltip' }
        data-place={ 'right' }
        data-html
        data-tip={ data[0].htmlPreview }
        className={ 'bib-wrapper-mini' }
        dangerouslySetInnerHTML={ { __html: data[0].htmlPreview } }
                        /> );
    }
    else {
       resourceTitle = getTitle( resource ) || translate( 'untitled resource' );
    }
    resourceTitle = abbrevString( resourceTitle, 10 );

    /**
     * Callbacks handlers
     */
    const handleMouseDown = ( e ) => {
      e.stopPropagation();
      if ( typeof onMouseDown === 'function' ) {
        onMouseDown();
      }
    };

    const handleDragStart = ( e ) => {
      if ( selectMode ) {
        return silentEvent( e );
      }
       this.setState( {
        moved: true
       } );
       const icon = new Image();
       icon.src = icons[type].black.svg;
       e.dataTransfer.setDragImage( icon, 0, 0 );
       e.dataTransfer.dropEffect = 'move';
       setDraggedResourceId( resource.id );
       // e.dataTransfer.setData('text', 'DRAFTJS_RESOURCE_ID:' + resource.id);
       e.dataTransfer.setData( 'text', ' ' );
    };

   const handleDragEnd = () => {
    this.setState( {
      moved: false
    } );
   };

   const handleDelete = ( event ) => {
    if ( event ) {
      event.stopPropagation();
    }
    if ( lockStatus === 'open' ) {
      onDelete( event );
    }
   };

   const handleClick = ( event ) => {
    if ( lockStatus !== 'locked' ) {
      onEdit( event );
    }
   };

   /**
    * @todo externalize this
    */
   const renderMoveComponent = () =>
        (
          <Button
            style={ { pointerEvents: 'none' } }
            data-place={ 'left' }
            data-effect={ 'solid' }
            data-for={ 'tooltip' }
          >
            <Icon
              isSize={ 'small' }
              isAlign={ 'left' }
            >
              <img src={ icons.move.black.svg } />
            </Icon>
          </Button>
        );

    return connectDragSource(
      <div
        // draggable
        onDragStart={ handleDragStart }
        onDragEnd={ handleDragEnd }
        onMouseDown={ handleMouseDown }
        style={ { cursor: 'move' } }
      >
        <Card
          isActive={ isActive }
          bodyContent={
            <div onClick={ handleClick }>
              <Columns style={ {
                minHeight: '4em',
                maxHeight: '4em',
                overflow: 'hidden',
                marginBottom: 0,
              } }
              >
                <Column
                  isSize={ 2 }
                >
                  <Icon
                    data-tip={ translate( resource.metadata.type ) }
                    data-for={ 'tooltip' }
                    isSize={ 'medium' }
                    data-effect={ 'solid' }
                    isAlign={ 'left' }
                  >
                    <img src={ icons[type].black.svg } />
                  </Icon>
                </Column>

                <Column
                  isSize={ 8 }
                >
                  <span
                    data-html
                    data-place={ 'bottom' }
                    data-tip={ resource.metadata.type === 'image' ? `<img style="max-width:10rem;max-height:10rem;" src="${getResourceDataUrl( resource.data )}"></img>` : undefined }
                    data-for={ 'tooltip' }
                  >
                    {resourceTitle}
                  </span>
                  <StatusMarker
                    style={ { marginLeft: '1rem' } }
                    lockStatus={ lockStatus }
                    statusMessage={ lockMessage }
                  />
                </Column>

              </Columns>
              <Columns>
                <Column
                  style={ { paddingTop: '.5rem' } }
                  isOffset={ 2 }
                  isSize={ 7 }
                >
                  <Button
                    onClick={ onEdit }
                    isDisabled={ lockStatus === 'locked' }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( 'settings' ) }
                  >
                    <Icon
                      isSize={ 'small' }
                      isAlign={ 'left' }
                    >
                      <img src={ icons.settings.black.svg } />
                    </Icon>
                  </Button>

                  <Button
                    onClick={ handleDelete }
                    isDisabled={ isActive || lockStatus === 'locked' }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( `delete this ${type}` ) }
                  >
                    <Icon
                      isSize={ 'small' }
                      isAlign={ 'left' }
                    >
                      <img src={ icons.remove.black.svg } />
                    </Icon>
                  </Button>

                  {type === 'image' &&
                  <Button
                    onClick={ onSetCoverImage }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    isColor={ coverImageId === resource.id ? 'info' : undefined }
                    data-tip={ translate( 'use as cover image' ) }
                  >
                    <Icon
                      isSize={ 'small' }
                      isAlign={ 'left' }
                    >
                      <img src={ icons.cover.black.svg } />
                    </Icon>
                  </Button>
                  }
                </Column>
                <Column
                  style={ { position: 'relative' } }
                  isSize={ 2 }
                >
                  <MovePad
                    style={ {
                      position: 'absolute',
                          top: '-4rem',
                          right: '4rem',
                    } }
                    moveComponentToolTip={ translate( 'Drag this item to the editor' ) }
                    MoveComponent={ renderMoveComponent }
                  />
                </Column>
              </Columns>
            </div>
        }
        />
      </div>
    );
  }
}

export default ResourceCard;
