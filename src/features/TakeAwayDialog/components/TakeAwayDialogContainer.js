/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the takeway dialog feature interface
 * @module fonio/features/TakeAwayDialog
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {debounce} from 'lodash';

import * as duck from '../duck';
import {
  selector as editorSelector,
} from '../../StoryEditor/duck';
import {
  selector as globalUiSelector,
  closeTakeAwayModal,
} from '../../GlobalUi/duck';

import {
  selector as storiesSelector,
  fetchStory,
  updateStory,
  saveStory,
} from '../../StoriesManager/duck';

import downloadFile from '../../../helpers/fileDownloader';
import {
  bundleProjectAsJSON,
  convertStoryToMarkdown,
} from '../../../helpers/projectBundler';

import {
  serverUrl
} from '../../../../secrets';

import TakeAwayDialogLayout from './TakeAwayDialogLayout';


/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.takeAway),
    ...globalUiSelector(state.globalUi),
    ...editorSelector(state.storyEditor),
    ...storiesSelector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      closeTakeAwayModal,
      saveStory,
      updateStory,
      fetchStory,
    }, dispatch)
  })
)
class TakeAwayDialogContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.takeAway = debounce(this.takeAway.bind(this), 300);
  }


  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize the component when sabilized
    return true;
  }

  /**
   * Wraps the different options for taking the story away,
   * launching proper actions or directly using proper utils
   * @param {string} takeAway - the take away method that is asked
   */
  takeAway(takeAwayType) {
    const title = this.props.activeStory.metadata.title;
    switch (takeAwayType.id) {
      case 'project':
        this.props.actions.fetchStoryBundle(this.props.activeStory.id, 'json')
        .then(res => {
          if (res.result && res.result.data) {
            const JSONbundle = bundleProjectAsJSON(res.result.data); // bundleProjectAsJSON(this.props.activeStory);
            downloadFile(JSONbundle, 'json', title);
          }
        });
        break;
      case 'markdown':
        this.props.actions.fetchStoryBundle(this.props.activeStory.id, 'json')
        .then(res => {
          if (res.result && res.result.data) {
            const markdownRep = convertStoryToMarkdown(res.result.data);
            downloadFile(markdownRep, 'md', title);
          }
        });
        break;
      case 'html':
        this.props.actions.fetchStoryBundle(this.props.activeStory.id, 'html')
        .then(res => {
          if (res.result && res.result.data) {
            downloadFile(res.result.data, 'html', title);
          }
        });
        break;
      default:
        break;
    }
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const serverAvailable = serverUrl !== undefined;
    return (
      <TakeAwayDialogLayout
        {...this.props}
        serverAvailable={serverAvailable}
        serverUrl={serverUrl}
        takeAway={this.takeAway} />
    );
  }
}

export default TakeAwayDialogContainer;
