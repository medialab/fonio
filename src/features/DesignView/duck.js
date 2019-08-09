/**
 * This module exports logic-related elements for the design view feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/DesignView
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { getStatePropFromActionSet } from '../../helpers/reduxUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
/**
 * UI
 */
import { RESET_VIEWS_UI } from '../EditionUiWrapper/duck';

const SET_DESIGN_ASIDE_TAB_MODE = 'SET_DESIGN_ASIDE_TAB_MODE';
const SET_DESIGN_ASIDE_TAB_COLLAPSED = 'SET_DESIGN_ASIDE_TAB_COLLAPSED';
const SET_REFERENCE_TYPES_VISIBLE = 'SET_REFERENCE_TYPES_VISIBLE';
const SET_COVER_IMAGE_CHOICE_VISIBLE = 'SET_COVER_IMAGE_CHOICE_VISIBLE';
const SET_CSS_HELP_VISIBLE = 'SET_CSS_HELP_VISIBLE';
const SET_TEMPLATE_CHOICE_VISIBLE = 'SET_TEMPLATE_CHOICE_VISIBLE';
const SET_NOTES_POSITION_CHOICE_VISIBLE = 'SET_NOTES_POSITION_CHOICE_VISIBLE';
const SET_FIGURES_POSITION_CHOICE_VISIBLE = 'SET_FIGURES_POSITION_CHOICE_VISIBLE';
const SET_REFERENCE_STATUS_CHOICE_VISIBLE = 'SET_REFERENCE_STATUS_CHOICE_VISIBLE';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setDesignAsideTabMode = ( payload ) => ( {
  type: SET_DESIGN_ASIDE_TAB_MODE,
  payload,
} );

export const setDesignAsideTabCollapsed = ( payload ) => ( {
  type: SET_DESIGN_ASIDE_TAB_COLLAPSED,
  payload,
} );

export const setReferenceTypesVisible = ( payload ) => ( {
  type: SET_REFERENCE_TYPES_VISIBLE,
  payload,
} );

export const setCssHelpVisible = ( payload ) => ( {
  type: SET_CSS_HELP_VISIBLE,
  payload,
} );

export const setCoverImageChoiceVisible = ( payload ) => ( {
  type: SET_COVER_IMAGE_CHOICE_VISIBLE,
  payload,
} );

export const setTemplateChoiceVisible = ( payload ) => ( {
  type: SET_TEMPLATE_CHOICE_VISIBLE,
  payload,
} );

export const setNotesPositionChoiceVisible = ( payload ) => ( {
  type: SET_NOTES_POSITION_CHOICE_VISIBLE,
  payload,
} );

export const setFiguresPositionChoiceVisible = ( payload ) => ( {
  type: SET_FIGURES_POSITION_CHOICE_VISIBLE,
  payload,
} );

export const setReferenceStatusChoiceVisible = ( payload ) => ( {
  type: SET_REFERENCE_STATUS_CHOICE_VISIBLE,
  payload,
} );

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const UI_DEFAULT_STATE = {
  designAsideTabMode: 'settings',
  designAsideTabCollapsed: false,
  referenceTypesVisible: false,
  cssHelpVisible: false,
  coverImageChoiceVisible: false,

  templateChoiceVisible: false,
  notesPositionChoiceVisible: false,
  figuresPositionChoiceVisible: false,
  referenceStatusChoiceVisible: false,
};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui( state = UI_DEFAULT_STATE, action ) {
  const { payload } = action;
  switch ( action.type ) {
    case RESET_VIEWS_UI:
      return UI_DEFAULT_STATE;
    case SET_DESIGN_ASIDE_TAB_MODE:
    case SET_DESIGN_ASIDE_TAB_COLLAPSED:
    case SET_REFERENCE_TYPES_VISIBLE:
    case SET_CSS_HELP_VISIBLE:
    case SET_COVER_IMAGE_CHOICE_VISIBLE:
    case SET_TEMPLATE_CHOICE_VISIBLE:
    case SET_NOTES_POSITION_CHOICE_VISIBLE:
    case SET_FIGURES_POSITION_CHOICE_VISIBLE:
    case SET_REFERENCE_STATUS_CHOICE_VISIBLE:
      const propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload
      };
    default:
      return state;
  }
}

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers( {
  ui,
} );

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const designAsideTabMode = ( state ) => state.ui.designAsideTabMode;
const designAsideTabCollapsed = ( state ) => state.ui.designAsideTabCollapsed;
const referenceTypesVisible = ( state ) => state.ui.referenceTypesVisible;
const cssHelpVisible = ( state ) => state.ui.cssHelpVisible;
const coverImageChoiceVisible = ( state ) => state.ui.coverImageChoiceVisible;
const templateChoiceVisible = ( state ) => state.ui.templateChoiceVisible;
const notesPositionChoiceVisible = ( state ) => state.ui.notesPositionChoiceVisible;
const figuresPositionChoiceVisible = ( state ) => state.ui.figuresPositionChoiceVisible;
const referenceStatusChoiceVisible = ( state ) => state.ui.referenceStatusChoiceVisible;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  designAsideTabMode,
  designAsideTabCollapsed,
  referenceTypesVisible,
  cssHelpVisible,
  coverImageChoiceVisible,
  templateChoiceVisible,
  notesPositionChoiceVisible,
  figuresPositionChoiceVisible,
  referenceStatusChoiceVisible,
} );
