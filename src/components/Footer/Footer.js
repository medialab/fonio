/**
 * This module provides a reusable Footer picker component for fonio
 * @module fonio/components/Footer
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import LangToggler from '../LangToggler/LangToggler';

import './Footer.scss';
import {translateNameSpacer} from '../../helpers/translateUtils';


/**
 * Renders the Footer component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const Footer = ({
  uiMode,
  lang,
  setLanguage,
  openTakeAwayModal,
  togglePreview,
  onClickMetadata,
  mode
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.Footer');
  return (
    mode === 'edit' ? (
      <footer className="fonio-Footer">
        <div className="left-group">
          <span className="mini-brand"><Link to="/"><button>Fonio</button></Link>| {translate('by')} <a href="http://www.medialab.sciences-po.fr/fr/" target="blank">médialab</a></span>
          <LangToggler
            lang={lang}
            onChange={setLanguage} />
        </div>
        <div className="middle-group" />
        <div className="right-group">
          <button className="mode-btn" onClick={togglePreview}>{
            uiMode === 'edition' ?
              <span>
                <img className="fonio-icon-image" src={require('../../sharedAssets/preview-white.svg')} />{translate('preview')}
              </span>
            :
              <span>
                <img className="fonio-icon-image" src={require('../../sharedAssets/edit-white.svg')} />{translate('edit')}
              </span>
          }</button>
          <button className="mode-btn" onClick={onClickMetadata} ><img className="fonio-icon-image" src={require('../../sharedAssets/settings-white.svg')} />{translate('story-settings')}</button>
          <button className="takeaway-btn" onClick={openTakeAwayModal}><img className="fonio-icon-image" src={require('../../sharedAssets/take-away-white.svg')} />{translate('take-away')}</button>
        </div>
      </footer>
    ) : (
      <footer className="fonio-Footer">
        <div className="left-group">
          <span className="mini-brand"><Link to="/"><button>Fonio</button></Link>| {translate('by')} <a href="http://www.medialab.sciences-po.fr/fr/" target="blank">médialab</a></span>
        </div>
      </footer>
    )
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
   * Active language
   */
  lang: PropTypes.string,

  /**
   * Callbacks when language is changed
   */
  setLanguage: PropTypes.func,

  /**
   * Callback when take away is asked
   */
  openTakeAwayModal: PropTypes.func,

  /**
   * Callbacks when preview is asked
   */
  togglePreview: PropTypes.func,

  /**
   * Callbacks when metadata button is clicked
   */
  onClickMetadata: PropTypes.func,
};

Footer.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default Footer;
