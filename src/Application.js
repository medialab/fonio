/* eslint react/jsx-no-bind:0 */

/**
 * Fonio Application Component
 * =======================================
 *
 * Root component of the application.
 * @module fonio
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';


import {loadUserInfo} from './helpers/localStorageUtils';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
} from 'react-router-dom';

import ReduxToastr from 'react-redux-toastr';

import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

import config from './config';

import Home from './features/HomeView/components/HomeViewContainer';
import ReadStory from './features/ReadStoryView/components/ReadStoryViewContainer';
import Summary from './features/SummaryView/components/SummaryViewContainer';
import Section from './features/SectionView/components/SectionViewContainer';
import Library from './features/LibraryView/components/LibraryViewContainer';
import Design from './features/DesignView/components/DesignViewContainer';
import AuthWrapper from './features/AuthManager/components/AuthManagerContainer';
import ErrorMessageContainer from './features/ErrorMessageManager/components/ErrorMessageContainer';

import * as connectionsDuck from './features/ConnectionsManager/duck';
import * as userInfoDuck from './features/UserInfoManager/duck';

import generateRandomUserInfo from './helpers/userInfo';

import 'quinoa-design-library/themes/millet/style.css';
import './Application.scss';

const ProtectedRoutes = ({match}) => {
  return (
    <AuthWrapper>
      <Route exact path={match.path} component={Summary} />
      <Route exact path={`${match.path}/section/:sectionId`} component={Section} />
      <Route exact path={`${match.path}/library`} component={Library} />
      <Route exact path={`${match.path}/design`} component={Design} />
    </AuthWrapper>
  );
};

/**
 * Renders the whole fonio application
 * @return {ReactComponent} component
 */
@connect(
  state => ({
    ...connectionsDuck.selector(state.connections),
    ...userInfoDuck.selector(state.userInfo),
    loadingBar: state.loadingBar.default,
    lang: state.i18nState.lang,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...userInfoDuck,
      ...connectionsDuck,
    }, dispatch)
  })
)
export default class Application extends Component {

  /**
   * constructorstorestore
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.confirmExit = this.confirmExit.bind(this);
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.confirmExit);
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.userId !== nextProps.userId && nextProps.userId) {
      const userId = nextProps.userId;
      const inheritedUserInfo = loadUserInfo();
      let userInfo;
      if (inheritedUserInfo) {
        userInfo = inheritedUserInfo;
      }
      else {
        userInfo = generateRandomUserInfo(this.props.lang);
      }
      userInfo.userId = userId;
      this.props.actions.setUserInfo(userInfo);
      this.props.actions.createUser(userInfo);
    }
  }

  confirmExit(e) {
    const {loadingBar} = this.props;
    if (loadingBar > 0) {
      const confirmationMessage = '\o/';
      e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
      return confirmationMessage;
    }
  }
  render() {
    const {
      props: {
        // usersNumber,
        userId
      }
    } = this;
    return (
      <ErrorMessageContainer>
        <Router basename={config.urlPrefix || '/'}>
          <div id="wrapper" className="fonio">
            {userId &&
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/story/:storyId" component={ProtectedRoutes} />
                <Route exact path={'/read/:storyId'} component={ReadStory} />
                <Route render={(props) => (
                      // TODO: render proper loading/error page
                  <h2>
                        No match for {props.location.pathname}, go back to <Link to="/">Home page</Link>
                  </h2>
                    )} />
              </Switch>
              }
            <ReduxToastr
              timeOut={6000}
              newestOnTop={false}
              preventDuplicates
              position="top-right"
              transitionIn="fadeIn"
              transitionOut="fadeOut" />
          </div>
        </Router>
      </ErrorMessageContainer>
    );
  }
}
