/**
 * This module previsualizew a visualization and transmits nodes positions when used for previewing a network.
 * It is connected to the redux logic to handle vis-to-data changes in network case
 * @module fonio/features/ConfigurationDialog
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import VisualizationManager from '../../../components/VisualizationManager/VisualizationManager';
import HelpPin from '../../../components/HelpPin/HelpPin';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import * as duck from '../duck';

@connect(
  state => ({
    ...duck.selector(state.presentationCandidate),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck
    }, dispatch)
  })
)
export default class VisualizationPreviewContainer extends Component {

  static contextTypes = {
    t: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.saveNodesPositions = this.saveNodesPositions.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.visualization.isSpatializing !== nextProps.visualization.isSpatializing
            || this.props.visualization.viewParameters !== nextProps.visualization.viewParameters;
  }

  saveNodesPositions() {
    if (this.visualization && this.visualization.getNodesPositions) {
      const nodes = this.visualization.getNodesPositions();
      this.props.actions.setVisualizationNodesPosition(this.props.visualizationKey, nodes);
    }
  }

  render() {
  const translate = translateNameSpacer(this.context.t, 'Features.ConfigurationDialog');
    const {
      visualization,
      visualizationKey,
      hasSlides
    } = this.props;
    const setIsSpatializing = () => this.props.actions.setVisualizationIsSpatializing(visualizationKey);
    const isSpatializing = visualization.isSpatializing;
    const viewParameters = visualization.viewParameters;
    const onChange = e => this.props.actions.setPreviewViewParameters(visualizationKey, e.viewParameters);
    const bindVisualizationRef = (vis) => {
      this.visualization = vis;
    };
    return (
      <section className="preview">
        <VisualizationManager
          visualizationType={visualization.metadata.visualizationType}
          data={visualization.data}
          viewParameters={viewParameters}
          isSpatializing={isSpatializing}
          ref={bindVisualizationRef}
          onUserChange={onChange} />
        {
          visualization.metadata.visualizationType === 'network' &&
          !hasSlides
          ?
            <div className="spatialization-controls">
              <button id="spatialize-nodes" className={isSpatializing ? 'active' : ''} onClick={setIsSpatializing}>
                {isSpatializing ? translate('stop-spatialization')
              : <span>
                {translate('run-spatialization')} <HelpPin position="left">
                  {translate('run-spatialization-help')}
                </HelpPin>
              </span>}
              </button>
              <button id="save-nodes" onClick={this.saveNodesPositions}>
                {translate('save-nodes-positions')}<HelpPin position="left">
                  {translate('save-nodes-positions-help')}
                </HelpPin>
              </button>
            </div>
          : null
        }
      </section>
    );
  }
}
