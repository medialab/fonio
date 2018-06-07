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

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom';

import Home from './features/HomeView/components/HomeViewContainer';
import Summary from './features/SummaryView/components/SummaryViewContainer';

import * as connectionsDuck from './features/ConnectionsManager/duck';
import * as userInfoDuck from './features/UserInfoManager/duck';

import generateRandomUserInfo from './helpers/userInfo';

import 'quinoa-design-library/themes/millet/style.css';
import './Application.scss';


import {
    urlPrefix
} from '../secrets';

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
      const userInfo = localStorage.getItem('fonio_user_info');
      let userInfoOk;
      if (userInfo) {
        try {
          userInfoOk = JSON.parse(userInfo);
        }
        catch (e) {
          userInfoOk = generateRandomUserInfo(this.props.lang);
        }
      }
      else {
        userInfoOk = generateRandomUserInfo(this.props.lang);
      }
      userInfoOk.userId = userId;
      this.props.actions.setUserInfo(userInfoOk);
      this.props.actions.createUser(userInfoOk);
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
      <Router basename={urlPrefix || '/'}>
        <div id="wrapper" className="fonio">
          {userId &&
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/story/:storyId" component={Summary} />
              <Route render={(props) => (
                // TODO: render proper loading/error page
                <h2>
                  No match for {props.location.pathname}, go back to <Link to="/">Home page</Link>
                </h2>
              )} />
            </Switch>
          }
        </div>
      </Router>
    );
  }
}
