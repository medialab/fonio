/**
 * This module provides an entrypoint for methods handling the complex logic
 * required to handle copying and pasting content in/from the editor
 * @module fonio/components/SectionEditor
 */
import copyManager from './handleCopy';
import pasteManager from './handlePaste';

/**
 * Prepares data within component's state for later pasting
 * @param {event} e - the copy event
 */
export const handleCopy = copyManager;

/**
 * Handles pasting command in the editor
 * @param {event} e - the copy event
 */
export const handlePaste = pasteManager;
