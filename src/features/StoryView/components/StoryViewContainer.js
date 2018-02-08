import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setLanguage} from 'redux-i18n';

import * as globalUiDuck from '../../GlobalUi/duck';
import * as managerDuck from '../../StoriesManager/duck';
import {fetchResources as fetchResourcesAction} from '../../ResourcesManager/duck';
import StoryViewLayout from './StoryViewLayout';


/**
 * Redux-decorated component class rendering the stories manager feature to the app
 */
@connect(
  state => ({
    ...globalUiDuck.selector(state.globalUi),
    ...managerDuck.selector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...globalUiDuck,
      ...managerDuck,
      fetchResources: fetchResourcesAction,
      setLanguage
    }, dispatch)
  })
)
export default class StoryViewContainer extends Component {
  /**
   * Context data used by the component
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: React.PropTypes.func.isRequired,

    /**
     * Redux store
     */
    store: PropTypes.object.isRequired
  }

  /**
   * constructorstorestore
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {match, actions} = this.props;
    const {fetchStory, fetchResources, setActiveStory, openPasswordModal} = actions;
    const activeStoryId = match.params.id;
    // TODO: optimize initialize story
    fetchStory(activeStoryId).then(res => {
      if (res.result) {
        setActiveStory(res.result);
        fetchResources(activeStoryId);
        if (match.params.mode === 'edit' && !localStorage.getItem(match.params.id)) {
          openPasswordModal(match.params.id);
        }
      }
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
    return (<StoryViewLayout {...this.props} />);
  }
}
