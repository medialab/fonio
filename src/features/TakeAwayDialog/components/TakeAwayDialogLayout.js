/**
 * This module exports a stateless component rendering the layout of the takeway dialog feature interface
 * @module fonio/features/TakeAwayDialog
 */
import React from 'react';
import PropTypes from 'prop-types';

import './TakeAwayDialogLayout.scss';

import BigSelect from '../../../components/BigSelect/BigSelect';
import Toaster from '../../../components/Toaster/Toaster';
import HelpPin from '../../../components/HelpPin/HelpPin';
import {translateNameSpacer} from '../../../helpers/translateUtils';

/**
 * Renders the options for takeaway mode choice
 * @param {object} props - the props to render
 * @param {function} takeAway - callback
 * @param {function} setTakeAwayType - callback
 * @param {string} takeAwayType - the active takeawayType
 * @param {boolean} serverAvailable - whether app is implemented with a distant server connection
 * @return {ReactElement} markup
 */
export const ChooseTakeAwayStep = ({
  takeAway,
  setTakeAwayType,
  takeAwayType,
  serverAvailable,
  serverHtmlUrl,
}, context) => {
  // namespacing the translation keys with feature id
  const translate = translateNameSpacer(context.t, 'Features.TakeAway');
  const optionSelect = (option) => {
    switch (option.id) {
      case 'server':
        if (!serverHtmlUrl) {
          takeAway(option);
        }
        return setTakeAwayType(option.id);
      default:
        return takeAway(option);
    }
  };
 // todo : put this data in a model file ? to decide
  const options = [
        {
          id: 'project',
          icon: require('../assets/project.svg'),
          label: <span>
            {translate('project-file')}
            <HelpPin>
              {translate('project-file-help')}
            </HelpPin></span>,
          possible: true
        },
        // {
        //   id: 'markdown',
        //   icon: require('../assets/html.svg'),
        //   label: <span>
        //     {translate('markdown-file')}
        //     <HelpPin>
        //       {translate('markdown-file-help')}
        //     </HelpPin></span>,
        //   possible: true
        // },
        {
          id: 'html',
          icon: require('../assets/html.svg'),
          label: <span>
            {translate('html-file')}
            <HelpPin position="left">
              {translate('html-file-help')}
            </HelpPin>
          </span>,
          possible: serverAvailable === true
        }
        ]
        .filter(option => option.possible === true);
  return (
    <BigSelect
      options={options}
      activeOptionId={takeAwayType}
      onOptionSelect={optionSelect} />
  );
};

ChooseTakeAwayStep.contextTypes = {
  t: PropTypes.func.isRequired
};


/**
 * Renders the layout of the take away dialog
 * @param {object} props - the props to render
 * @param {object} props.activeStory - the story to take away
 * @param {string} props.takeAwayType - the active takeaway type
 * @param {string} props.takeAwayLog
 * @param {string} props.takeAwayLogStatus
 * @param {boolean} props.serverAvailable - whether app is connected to a distant server
 * @param {string} props.serverUrl - the url base of the distant server
 * @param {function} props.takeAway - main callback function for container
 * @param {function} props.updateActiveStoryFromServer -
 * @param {object} props.actions - actions passed by redux logic
 * @return {ReactElement} markup
 */
const TakeAwayDialogLayout = ({
  //stories selectors
  activeStory,
  takeAwayType,
  takeAwayLog,
  takeAwayLogStatus,
  serverAvailable,
  // actions
  takeAway,
  actions: {
    closeTakeAwayModal,
    setTakeAwayType
  },
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.TakeAway');
  return (
    <div className="fonio-TakeAwayDialogLayout">
      <h1 className="modal-header">
        <span className="modal-header-title">{translate('take-away-your-story')}</span>
        <button className="close-btn" onClick={closeTakeAwayModal}>
          <img src={require('../../../sharedAssets/cancel-white.svg')} />
        </button>
      </h1>
      <section className="modal-content">
        <section className="modal-row">
          <ChooseTakeAwayStep
            takeAway={takeAway}
            setTakeAwayType={setTakeAwayType}
            serverAvailable={serverAvailable}
            takeAwayType={takeAwayType}
            serverHtmlUrl={activeStory && activeStory.metadata && activeStory.metadata.serverHTMLUrl} />
        </section>
        <section className={'modal-row ' + (takeAwayLogStatus ? '' : 'empty')}>
          <Toaster status={takeAwayLogStatus} log={takeAwayLog} />
        </section>
      </section>
      <section className="modal-footer">''</section>
    </div>);
};


/**
 * Context data used by the component
 */
TakeAwayDialogLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default TakeAwayDialogLayout;
