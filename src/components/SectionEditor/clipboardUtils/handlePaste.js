/**
 * This module provides the logic for handling pasting text in editor
 * @module fonio/components/SectionEditor
 */
import pasteFromOutside from './pasteFromOutside';
import pasteFromInside from './pasteFromInside';

const handlePaste = function( html ) {

    const {
      props,

      editor,

      /*
       * editor,
       * onEditorChange
       */
    } = this;
    // ensuring this is happening while editing the content
    if ( !props.editorFocus ) {
      return;
    }

    const {
      story,
      editorFocus,
      activeSection,
      editorStates,
      createContextualization,
      createContextualizer,
      createResource,
      updateDraftEditorsStates,
      updateDraftEditorState,
      updateSection,
      userId,
      setEditorPastingStatus,
      setEditorFocus,
      uploadResource,
    } = props;

    const {
      id: storyId,
      resources
    } = story;

    if ( !Object.keys( editorStates ).length ) return;

    const {
      notes,
      id: activeSectionId
    } = activeSection;

    /*
     * const {
     *   // clipboard, // blockMap of the data copied to clipboard
     *   // copiedData, // model-dependent set of data objects saved to clipboard
     * } = state;
     */

    let copiedData;

    const activeEditorStateId = editorFocus === 'main' ? activeSectionId : editorFocus;
    const activeEditorState = editorStates[activeEditorStateId];

    // check whether the clipboard contains fonio data
    const dataRegex = /<script id="fonio-copied-data" type="application\/json">(.*)<\/script>$/gm;
    const hasScript = dataRegex.test( html );

    /**
     * ======================================
     * case 1 : comes from outside (no fonio data)
     * ======================================
     */
    if ( !hasScript ) {
      return pasteFromOutside( {
        html,
        activeEditorState,
        updateSection,
        createResource,
        createContextualization,
        createContextualizer,
        updateDraftEditorState,

        setEditorPastingStatus,

        userId,
        activeEditorStateId,
        activeSection,
        storyId,
        resources,
        editorFocus,
        uploadResource,

        setEditorFocus,
      } );
    }

    /**
     * =============================================
     * case 2 : pasting comes from inside the editor
     * =============================================
     */
    else {
      return pasteFromInside( {
        updateSection,
        createContextualization,
        createContextualizer,
        userId,
        updateDraftEditorsStates,
        activeSection,
        storyId,
        editorFocus,
        setEditorPastingStatus,
        createResource,
        uploadResource,

        story,
        editor,
        notes,
        editorStates,
        copiedData,
        html,
        dataRegex,
      } );
    }
  };

export default handlePaste;
