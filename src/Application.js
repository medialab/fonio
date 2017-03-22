/**
 * Bulgur Application Component
 * =======================================
 *
 * Root component of the application.
 * @module fonio
 */
import React from 'react';

import './core.scss';
import './Application.scss';

import Editor from './features/Editor/components/EditorContainer.js';

/**
 * Renders the whole fonio application
 * @return {ReactComponent} component
 */
const Application = ({}) => (
  <Editor
    id="wrapper"
    className="fonio-editor" />
);

export default Application;
