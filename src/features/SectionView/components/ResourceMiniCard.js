/* eslint react/no-set-state : 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import ReactTooltip from 'react-tooltip';

import {DragSource} from 'react-dnd';

import resourceSchema from 'quinoa-schemas/resource';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {Bibliography} from 'react-citeproc';
import english from 'raw-loader!../../../sharedAssets/bibAssets/english-locale.xml';
import apa from 'raw-loader!../../../sharedAssets/bibAssets/apa.csl';


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
        title,
      } = metadata;

      const translate = translateNameSpacer(t, 'Features.SectionView');

      const specificSchema = resourceSchema.definitions[type];

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
      if (specificSchema.showMetadata && title) {
        resourceTitle = title;
      }
     else if (type === 'glossary' && data && data.name) {
        resourceTitle = data.name;
      }
     else if (type === 'bib' && data && data[0]) {
        const bibData = {
          [data[0].id]: data[0]
        };
        resourceTitle = <Bibliography items={bibData} style={apa} locale={english} />;
      }
     else resourceTitle = translate('untitled resource');


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
                      onClick={onDelete} isDisabled={isActive || lockStatus === 'locked'} data-for="card-action"
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

/**
 * Component's properties types
 */
ResourceCard.propTypes = {

  /**
   * data of the card
   */
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),

  /**
   * metadata of the card
   */
  metadata: PropTypes.object,

  /**
   * Callbacks when the card is asked to be deleted
   */
  onDelete: PropTypes.func,

  /**
   * Callbacks when the card is asking to be configured
   */
  onConfigure: PropTypes.func,

  /**
   * whether the resource is currently asking user whether to delete it
   */
  // promptedToDelete: PropTypes.bool,

  /**
   * callbacks when user asks for resource deletion
   */
  onRequestDeletePrompt: PropTypes.func,

  /**
   * callbacks when user dismisses the section deletion prompt
   */
  onAbortDeletePrompt: PropTypes.func,


  /**
   * Whether the card is in select mode
   */
  selectMode: PropTypes.bool,

  /**
   * Callbacks when the card is selected
   */
  onSelect: PropTypes.func,

  /**
   * Map of actions to execute when the card is started dragged
   */
  connectDragSource: PropTypes.object,

  /**
   * Map of actions to execute when the card has to be previewed
   */
  connectDragPreview: PropTypes.object,

  /**
   * Map of actions to execute when the card is dropped
   */
  connectDropTarget: PropTypes.object,

  /**
   * Callbacks when the card is pressed
   */
  onMouseDown: PropTypes.func,
};

export default ResourceCard;
