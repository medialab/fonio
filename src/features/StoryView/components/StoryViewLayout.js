/* eslint no-nested-ternary:0 */

/**
 * This module exports a stateless component rendering the layout of the story view interface
 * @module fonio/features/StoryPage
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {Link} from 'react-router-dom';

import {translateNameSpacer} from '../../../helpers/translateUtils';


import StoryPlayer from 'quinoa-story-player';


import TakeAwayDialog from '../../TakeAwayDialog/components/TakeAwayDialogContainer';
import StoryEditorContainer from '../../StoryEditor/components/StoryEditorContainer';
import StorySettingsManagerContainer from '../../StorySettingsManager/components/StorySettingsManagerContainer';

import './StoryViewLayout.scss';

const StoryViewLayout = ({
  match,
  globalUiMode,
  activeStory,
  storyToasterLogStatus,
  // lang,
  isTakeAwayModalOpen,
  actions: {
    // setLanguage,
    // setUiMode,
    // startStoryCandidateConfiguration,
    // openTakeAwayModal,
    closeTakeAwayModal
  }
}, {t}) => {

  /**
   * Callbacks
   */

  // callback for preview mode tweaking
  // const togglePreview = () => {
  //   if (globalUiMode === 'edition') {
  //     setUiMode('preview');
  //   }
  //  else {
  //     setUiMode('edition');
  //   }
  // };
  // const onClickMetadata = () => {
  //   startStoryCandidateConfiguration(activeStory);
  // };

  const translate = translateNameSpacer(t, 'Components.StoryViewLayout');


  return (
    activeStory ?
      <div className="fonio-StoryViewLayout">
        <section className="fonio-main-row">
          {match.params.mode ?
            (globalUiMode === 'edition' ?
              <StoryEditorContainer /> :
              <StorySettingsManagerContainer />
            )
            : (<StoryPlayer story={activeStory} />)}
        </section>

        <Modal
          onRequestClose={closeTakeAwayModal}
          isOpen={isTakeAwayModalOpen}>
          <TakeAwayDialog />
        </Modal>
      </div> :
      // TODO: loading/error page
      (storyToasterLogStatus === 'failure' &&
        <h2 className="fonio-NotFound">
          {translate('story-not-found-go-back-to')}<span /><Link to="/"> {translate('home page')}</Link>
        </h2>
      )
  );
};

/**
 * Context data used by the component
 */
StoryViewLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default StoryViewLayout;
