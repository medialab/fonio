

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
