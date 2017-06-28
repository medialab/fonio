/**
 * Fonio Application Component
 * =======================================
 *
 * Root component of the application.
 * @module fonio
 */
import React from 'react';

import './core.scss';
import './Application.scss';

import GlobalUi from './features/GlobalUi/components/GlobalUiContainer.js';

/**
 * Renders the whole fonio application
 * @return {ReactComponent} component
 */
const Application = ({}) => (
  <GlobalUi
    id="wrapper"
    className="fonio" />
);

export default Application;
