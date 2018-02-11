/* eslint react/jsx-no-bind:0 */

/**
 * Fonio Application Component
 * =======================================
 *
 * Root component of the application.
 * @module fonio
 */
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom';

import './core.scss';
import './Application.scss';

import GlobalUi from './features/GlobalUi/components/GlobalUiContainer.js';
import StoryView from './features/StoryView/components/StoryViewContainer.js';
import StoriesManager from './features/StoriesManager/components/StoriesManagerContainer';


/**
 * Renders the whole fonio application
 * @return {ReactComponent} component
 */
const Application = ({}) => (
  <Router>
    <div id="wrapper" className="fonio">
      <GlobalUi />
      <Switch>
        <Route exact path="/" component={StoriesManager} />
        <Route path="/story/:id/:mode?" render={(props) => (<StoryView {...props} />)} />
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

export default Application;
