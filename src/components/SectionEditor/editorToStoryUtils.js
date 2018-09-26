/**
 * Imports Libraries
 */
import {
  utils,
} from 'scholar-draft';

/**
 * Shared variables
 */
const {
  getUsedAssets,
  updateNotesFromEditor,
} = utils;

/**
 * Deletes notes that are not any more linked
 * to an entity in the editor
 * and update notes numbers if their order has changed.
 * @param {object} props - properties to use
 */
export const updateNotesFromSectionEditor = ( props ) => {
  const {
    editorStates,
    sectionId,
    activeStoryId,
    activeSection,
    updateSection,
  } = props;
  const {
    // newNotes,
    notesOrder
  } = updateNotesFromEditor( editorStates[sectionId], { ...activeSection.notes } );
  const newSection = activeSection;
  // newSection.notes = newNotes;
  newSection.notesOrder = notesOrder;
  // if (newNotes !== activeSection.notes) {
    updateSection( activeStoryId, sectionId, newSection );
  // }
};

/**
 * Deletes contextualizations that are not any more linked
 * to an entity in the editor.
 * @param {object} props - properties to use
 */
export const updateContextualizationsFromEditor = ( props ) => {
    const {
      activeSection,
      editorStates,
      deleteContextualization,
      deleteContextualizer,
      // sectionId,
      story,
      userId
    } = props;
    const activeStoryId = story.id;
    const activeSectionId = activeSection.id;
    // regroup all eligible editorStates
    const notesEditorStates = activeSection.notesOrder.reduce( ( result, noteId ) => {
      return {
        ...result,
        [noteId]: editorStates[noteId]
      };
    }, {} );
    // regroup all eligible contextualizations
    const sectionContextualizations = Object.keys( story.contextualizations )
      .filter( ( id ) => {
        return story.contextualizations[id].sectionId === activeSectionId;
      } )
      .reduce( ( final, id ) => ( {
        ...final,
        [id]: story.contextualizations[id],
      } ), {} );

    // look for used contextualizations in main
    let used = getUsedAssets( editorStates[activeSectionId], sectionContextualizations );
    // look for used contextualizations in notes
    Object.keys( notesEditorStates )
    .forEach( ( noteId ) => {
      const noteEditor = notesEditorStates[noteId];
      used = used.concat( getUsedAssets( noteEditor, sectionContextualizations ) );
    } );

    /*
     * compare list of contextualizations with list of used contextualizations
     * to track all unused contextualizations
     */
    const unusedAssets = Object.keys( sectionContextualizations ).filter( ( id ) => used.indexOf( id ) === -1 );
    // delete contextualizations
    unusedAssets.forEach( ( id ) => {
      const { contextualizerId } = sectionContextualizations[id];
      deleteContextualization( { storyId: activeStoryId, contextualizationId: id, userId } );
      deleteContextualizer( { storyId: activeStoryId, contextualizerId, userId } );
    } );
  };
