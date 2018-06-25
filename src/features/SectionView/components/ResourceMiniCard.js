/* eslint react/no-set-state : 0 */
/* eslint react/no-danger : 0 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import ReactTooltip from 'react-tooltip';

import {DragSource} from 'react-dnd';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {
  Button,
  Card,
  Column,
  Columns,
  Icon,
  StatusMarker,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';
import './ResourceMiniCard.scss';


/**
 * react-dnd drag & drop handlers
 */


/**
 * drag source handler
 */
const resourceSource = {
  beginDrag(props) {
    return {
      id: props.sectionKey,
      index: props.sectionIndex
    };
  }
};


/**
 * dnd-related decorators for the ResourceCard component
 */
@DragSource('RESOURCE', resourceSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))

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
    t: PropTypes.func.isRequired
  }


  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.state = {
      moved: undefined
    };
  }

  componentDidMount() {
    // const {connectDragPreview} = this.props;
    // console.log('connect preview');
    // connectDragPreview(<div>preview</div>);
    const {
      connectDragPreview,
      resource = {}
    } = this.props;
    const {metadata = {}} = resource;
    const {type = 'bib'} = metadata;
    const img = new Image();
    img.src = icons[type].black.svg;
    img.onload = () =>
      connectDragPreview(img);
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      props,
      context: {t}
    } = this;
    const {
      resource = {},
      lockData,
      isActive,
      onEdit,
      onDelete,
      getTitle,
      // onSetCoverImage,
      selectMode,

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

      const translate = translateNameSpacer(t, 'Features.SectionView');


      let lockStatus;
      let lockMessage;
      if (isActive) {
        lockStatus = 'active';
        lockMessage = translate('edited by you');
      }
      else if (lockData) {
        lockStatus = 'locked';
        lockMessage = translate('edited by {a}', {a: lockData.name});
      }
      else {
        lockStatus = 'open';
        lockMessage = translate('open to edition');
      }

      let resourceTitle;
      if (type === 'bib' && data && data[0]) {
        resourceTitle = <div className="bib-wrapper-mini" dangerouslySetInnerHTML={{__html: data[0].htmlPreview}} />;
      }
      else resourceTitle = getTitle(resource) || translate('untitled resource');

    /**
     * component's callbacks
     */

    const onMDown = () => {
      if (typeof onMouseDown === 'function') {
        onMouseDown();
      }
    };

    const startDrag = (e) => {
      if (selectMode) {
        return e.preventDefault();
      }
       this.setState({
        moved: true
       });
       const icon = new Image();
       icon.src = icons[type].black.svg;
       e.dataTransfer.setDragImage(icon, 0, 0);
       e.dataTransfer.dropEffect = 'move';
       e.dataTransfer.setData('text', 'DRAFTJS_RESOURCE_ID:' + resource.id);
     };

     const endDrag = () => {
      this.setState({
        moved: false
      });
     };

     const handleDelete = () => {
      if (lockStatus === 'open') {
        onDelete();
      }
     };

      return connectDragSource(
        <div
          // draggable
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onMouseDown={onMDown}>
          <Card
            bodyContent={
              <div>
                <Columns>
                  <Column isSize={2}>
                    <Icon isSize="medium" isAlign="left">
                      <img src={icons[type].black.svg} />
                    </Icon>
                  </Column>

                  <Column isSize={8}>
                    {resourceTitle}
                  </Column>

                  <Column isSize={2}>
                    <StatusMarker
                      lockStatus={lockStatus}
                      statusMessage={lockMessage} />
                  </Column>
                </Columns>
                <Columns>
                  <Column isOffset={2} isSize={10}>
                    <Button data-for="card-action" data-tip={translate('drag this card to the editor')}>
                      <Icon isSize="small" isAlign="left">
                        <img src={icons.move.black.svg} />
                      </Icon>
                    </Button>
                    <Button
                      onClick={onEdit} isDisabled={isActive || lockStatus === 'locked'} data-for="card-action"
                      data-tip={'settings'}>
                      <Icon isSize="small" isAlign="left">
                        <img src={icons.settings.black.svg} />
                      </Icon>
                    </Button>
                    <Button
                      onClick={handleDelete} isDisabled={isActive || lockStatus === 'locked'} data-for="card-action"
                      data-tip={translate('delete this resource')}>
                      <Icon isSize="small" isAlign="left">
                        <img src={icons.remove.black.svg} />
                      </Icon>
                    </Button>
                    {type === 'image' &&
                      <Button data-for="card-action" data-tip={translate('use as cover image')}>
                        <Icon isSize="small" isAlign="left">
                          <img src={icons.cover.black.svg} />
                        </Icon>
                      </Button>
                    }
                  </Column>
                </Columns>
                <ReactTooltip
                  place="right"
                  effect="solid"
                  id="card-action" />
              </div>
                } />
        </div>
      );
  }
}


export default ResourceCard;
