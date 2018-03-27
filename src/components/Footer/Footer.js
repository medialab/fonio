/**
 * This module provides a reusable Footer picker component for fonio
 * @module fonio/components/Footer
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import {Link} from 'react-router-dom';
// import LangToggler from '../LangToggler/LangToggler';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import './Footer.scss';

import * as duck from '../../features/GlobalUi/duck';

import {translateNameSpacer} from '../../helpers/translateUtils';

/**
 * Renders the Footer component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const Footer = ({
  globalUiMode,
  actions: {
    openTakeAwayModal,
    setUiMode,
  }
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.Footer');
  const togglePreview = () => {
    if (globalUiMode === 'edition') {
      setUiMode('preview');
    }
 else setUiMode('edition');
  };
  return (

    <footer className="fonio-Footer">
      <button className={`mode-btn ${globalUiMode}`} onClick={togglePreview}>{
            globalUiMode === 'edition' ?
              <span>
                <img className="fonio-icon-image" src={require('../../sharedAssets/preview-white.svg')} />{translate('preview')}
              </span>
            :
              <span>
                <img className="fonio-icon-image" src={require('../../sharedAssets/edit-white.svg')} />{translate('edit')}
              </span>
          }</button>
      {/*<button className="mode-btn" onClick={onClickMetadata} ><img className="fonio-icon-image" src={require('../../sharedAssets/settings-white.svg')} />{translate('story-settings')}</button>*/}
      <button className="takeaway-btn" onClick={openTakeAwayModal}><img className="fonio-icon-image" src={require('../../sharedAssets/take-away-white.svg')} />{translate('take-away')}</button>
    </footer>
  );
};


/**
 * Component's properties types
 */
Footer.propTypes = {

  /**
   * Describes if in "edit" or "preview" mode for the main view
   */
  uiMode: PropTypes.string,

  /**
   * Callback when take away is asked
   */
  openTakeAwayModal: PropTypes.func,

  /**
   * Callbacks when preview is asked
   */
  setUiMode: PropTypes.func,
};

Footer.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

@connect(
  state => ({
    ...duck.selector(state.globalUi),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
    }, dispatch)
  })
)
export default class ConnectedFooter extends Component {
  render = () => {
    return <Footer {...this.props} />;
  }
}
