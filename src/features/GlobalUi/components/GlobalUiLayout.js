
/* eslint react/jsx-no-bind:0 */
/* eslint no-nested-ternary:0 */

/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/GlobalUi
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar';

import './GlobalUiLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import Footer from '../../../components/Footer/Footer';
import StoryEditorContainer from '../../StoryEditor/components/StoryEditorContainer';
import StorySettingsManagerContainer from '../../StorySettingsManager/components/StorySettingsManagerContainer';
import StoryPlayer from 'quinoa-story-player';
import PasswordModal from '../../../components/PasswordModal/PasswordModal';

import StoriesManagerContainer from '../../StoriesManager/components/StoriesManagerContainer';
import ConfigurationDialog from '../../ConfigurationDialog/components/ConfigurationDialogContainer';
import TakeAwayDialog from '../../TakeAwayDialog/components/TakeAwayDialogContainer';


/**
 * EmbedContainer class for building react component instances
 * that wrap an embed/iframe element
 * (it is just aimed at preventing intempestuous reloading of embed code)
 */
class StoryContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const {match} = this.props;
    const activeStoryId = match.params.id;
    this.props.fetchStory(activeStoryId).then(res => {
      if (res.result) this.props.setActiveStory(res.result);
    });
  }

  shouldComponentUpdate() {
    return true;
  }
  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      match,
      history,
      globalUiMode,
      openTakeAwayModal,
      togglePreview,
      lang,
      setLanguage,
      activeStory,
      startStoryCandidateConfiguration,
      isTakeAwayModalOpen,
      closeTakeAwayModal,
      fetchStoryLog,
      fetchStoryLogStatus
    } = this.props;
    const activeStoryId = match.params.id;

    return (
      activeStory ?
        <div className="story-editor-container">
          <section className="fonio-main-row">
            {match.params.mode ?
              (globalUiMode === 'edition' ?
                (sessionStorage.getItem(activeStoryId) ?
                  <StoryEditorContainer activeStoryId={match.params.id} /> :
                  <Redirect to={{
                    pathname: '/login',
                    state: {
                      storyId: activeStoryId,
                      to: `/story/${activeStoryId}/edit`
                    }
                  }} />
                ) : <StorySettingsManagerContainer activeStoryId={match.params.id} />
              ) : (
                <StoryPlayer story={activeStory} />
            )}
          </section>
          <Footer
            openTakeAwayModal={openTakeAwayModal}
            togglePreview={togglePreview}
            lang={lang}
            setLanguage={setLanguage}
            uiMode={globalUiMode}
            activeStory={activeStory}
            startStoryCandidateConfiguration={startStoryCandidateConfiguration}
            mode={match.params.mode} />
          <Modal
            onRequestClose={closeTakeAwayModal}
            isOpen={isTakeAwayModalOpen}>
            <TakeAwayDialog history={history} />
          </Modal>
        </div> :
        // TODO: loading/error page
        <h2>
          {fetchStoryLog}
          {fetchStoryLogStatus === 'failure' &&
          <span>
            , go back to <Link to="/">Home page</Link>
          </span>}
        </h2>
    );
  }
}


/**
 * Component's properties types
 */
StoryContainer.propTypes = {

};
/**
 * Renders the main layout component of the editor
 * @param {object} props - the props to render
 * @param {string} props.lang - the active language
 * @param {string} props.id
 * @param {string} props.className
 * @param {boolean} props.isStoryCandidateModalOpen
 * @param {string} props.globalUiMode
 * @param {boolean} props.isTakeAwayModalOpen
 * @param {string} props.slideSettingsPannelState
 * @param {object} props.activeViews - object containing the views being displayed in the editor
 * @param {string} props.activeSlideId
 * @param {object} props.editedColor
 * @param {string} props.activeStoryId
 * @param {object} props.activeStory
 * @param {function} props.onProjectImport
 * @param {function} props.returnToLanding
 * @param {object} props.actions - actions passed by redux logic
 * @param {function} props.openSettings
 * @param {function} props.closeAndResetDialog
 * @return {ReactElement} markup
 */
const GlobalUiLayout = ({
  lang,
  // setup related
  id,
  className,

  // global ui related
  isStoryCandidateModalOpen,
  globalUiMode,
  isTakeAwayModalOpen,
  // stories related
  activeStory,
  // storiesUi related
  password,
  loginStoryLog,
  loginStoryLogStatus,
  fetchStoryLog,
  fetchStoryLogStatus,
  // actions,
  actions: {
    openTakeAwayModal,
    closeTakeAwayModal,
    setUiMode,
    setLanguage,
    setActiveStory,

    startStoryCandidateConfiguration,
    fetchStory,
    loginStory,
    enterPassword,
  },
  // custom functions
  closeAndResetDialog,
}, context) => {

  /**
   * Callbacks
   */

  // callback for preview mode tweaking
  const togglePreview = () => {
    if (globalUiMode === 'edition') {
      setUiMode('preview');
    }
   else {
      setUiMode('edition');
    }
  };

  // namespacing the translation keys
  const translate = translateNameSpacer(context.t, 'Features.GlobalUi');
  return (
    <Router>
      <div id={id} className={'fonio-GlobalUiLayout ' + className}>
        <LoadingBar style={{backgroundColor: '#3fb0ac', zIndex: 10}} />
        <Modal
          onRequestClose={closeAndResetDialog}
          contentLabel={translate('edit-story')}
          isOpen={isStoryCandidateModalOpen}>
          <ConfigurationDialog />
        </Modal>
        <Switch>
          <Route exact path="/" component={StoriesManagerContainer} />
          <Route
            path="/story/:id/:mode?" render={(props) => (
              <StoryContainer
                {...props}
                globalUiMode={globalUiMode}
                openTakeAwayModal={openTakeAwayModal}
                togglePreview={togglePreview}
                lang={lang}
                setLanguage={setLanguage}
                setActiveStory={setActiveStory}
                fetchStory={fetchStory}
                fetchStoryLog={fetchStoryLog}
                fetchStoryLogStatus={fetchStoryLogStatus}
                activeStory={activeStory}
                startStoryCandidateConfiguration={startStoryCandidateConfiguration}
                isTakeAwayModalOpen={isTakeAwayModalOpen}
                closeTakeAwayModal={closeTakeAwayModal} />
            )} />
          <Route
            path="/login" render={(props) => (
              <PasswordModal
                {...props}
                password={password}
                loginStory={loginStory}
                enterPassword={enterPassword}
                loginStoryLogStatus={loginStoryLogStatus}
                loginStoryLog={loginStoryLog} />
          )} />
          <Route render={(props) => (
            // TODO: loading/error page
            <h2>
              No match for {props.location.pathname}, go back to <Link to="/">Home page</Link>
            </h2>
          )} />
        </Switch>
      </div>
    </Router>
    );
};


/**
 * Context data used by the component
 */
GlobalUiLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};


export default GlobalUiLayout;
