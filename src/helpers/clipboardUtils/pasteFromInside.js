/**
 * This module provides the logic for handling pasting in editor when pasted content
 * comes from Fonio
 * @module fonio/components/SectionEditor
 */
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  CharacterMetadata,
} from 'draft-js';

import {
  v4 as generateId
} from 'uuid';

import {
  utils,
  constants,
  QuoteContainer,
  InlineAssetContainer,
  NotePointer,
} from 'scholar-draft';

const {
  NOTE_POINTER,
  INLINE_ASSET,
  BLOCK_ASSET,
} = constants;

const {
  updateNotesFromEditor,
  insertFragment,
  createDecorator,
  findNotePointer,
  findQuotes,
  findInlineAsset
} = utils;

/**
 * reverses a map by swapping keys and values
 * @param {object} initialMap
 * @return {object} updatedMap
 */
const reverseMap = ( initialMap ) => Object.keys( initialMap )
  .reduce( ( cur, key ) => ( {
    ...cur,
    [initialMap[key]]: key
  } ), {} );

/**
 * check if a draft entity serialized object is a contextualization reference
 * @param {object} entity - the serialized entity object
 * @return {boolean}
 */
const isEntityAContextualizationReference = ( entity ) =>
  [ INLINE_ASSET, BLOCK_ASSET ].includes( entity.type );

/**
 * check if a draft entity serialized object is a note reference
 * @param {object} entity - the serialized entity object
 * @return {boolean}
 */
const isEntityANoteReference = ( entity ) =>
  entity.type === NOTE_POINTER;

/**
 * retrieve packed resources stored in local storage
 * (used for cases of pasting deleted resources)
 * @return {array} resources
 */
const retrieveCopiedResources = () => {
  let copiedResources = [];
  try {
    copiedResources = JSON.parse( localStorage.getItem( 'fonio/copied-resources' ) );
  }
  catch ( err ) {
    console.error( 'could not retreive copied resources, reason: ', err );/* eslint no-console: 0 */
  }
  return copiedResources;
};

/**
 * extract serialized json data stored in the clipboard
 * html representation when copied happened inside the editor
 * (it contains copied entities, contents, contextualizations, contextualizers, notes, ...)
 * @param {string} html
 * @param {regexp} dataRegexp - the regexp used to fetch serialized data (must be synced with handleCopy way of storing the data)
 * @return {object} copied data object
 */
export const extractCopiedData = ( html, dataRegex ) => {
  let actualHtml = html;
  let copiedData;
  try {
    // extract jsonified draft-js clipboard
   let json;
   let match = html.match( dataRegex );

    while ( ( match = dataRegex.exec( html ) ) !== null ) {
      json = match[1];
      actualHtml = `${actualHtml.slice( 0, match.index )}${actualHtml.slice( match.index + match[0].length )}`;
    }
    copiedData = JSON.parse( json );
  }
 catch ( e ) {
    console.error( 'an error occured while trying to extract custom clipboard data: ', e );/* eslint no-console : 0 */
  }
  return copiedData;
};

/**
 * Filter out contextualizations that do not point to an existing or saved resource
 * @return {object} - new contextualizations, contextualizers, and resources to create from saved resources
 */
export const filterInvalidContextualizations = ( {
  contextualizationsList,
  contextualizersList,
  storyResources,
  copiedResources,
} ) => {
  const resourcesToCreate = [];
  let filteredContextualizers = [ ...contextualizersList ];
  const filteredContextualizations = contextualizationsList.filter( ( contextualization ) => {
    let isValid = true;
    // resource does not exist anymore -> try to fetch it from copiedResources (retrieved from local storage previously)
    if ( !storyResources[contextualization.resourceId] ) {
      const savedResource = ( copiedResources || [] ).find( ( resource ) => resource.id === contextualization.resourceId );
      if ( savedResource ) {
        resourcesToCreate.push( savedResource );
      // if resource is not there and not saved, then it is invalid
      }
      else isValid = false;
    }

    /*
     * if contextualization is orphan of resource, we also filter out the related contextualizer
     * @todo change if we implement contextualizers reutilization
     */
    if ( !isValid ) {
      filteredContextualizers = filteredContextualizers.filter( ( contextualizer ) => {
        return contextualizer.id !== contextualization.contextualizerId;
      } );
    }
    return isValid;
  } );
  return {
    filteredContextualizations,
    resourcesToCreate,
    filteredContextualizers,
  };
};

/**
 * remove block contextualizations from copied data
 * (for cases of copying contents from main editor to a note)
 * @return {array} filtered contextualizations list
 */
export const removeBlockContextualizationsFromCopiedData = ( {
  contextualizationsList,
  contextualizersList
} ) => {
  return contextualizationsList.filter( ( contextualization ) => {
    const thatContextualizer = contextualizersList.find( ( contextualizer ) => contextualizer.id === contextualization.contextualizerId );

    /**
     * @todo solve that from schemas
     */
    if ( thatContextualizer && [ 'image', 'embed', 'video', 'table' ].includes( thatContextualizer.type ) ) {
      return false;
    }
    return true;
  } );
};

/**
 * Creates a map of EditorStates for a given section
 * @return {object} new editor states map
 */
export const createEditorStatesMap = ( {
  mainEditorState,
  editorStates,
  notes,
  sectionId,
  editorFocus,
  createLocalDecorator
} ) => Object.keys( notes ).reduce( ( editors, noteId ) => {
  return {
    ...editors,
    [noteId]: noteId === editorFocus ?
        EditorState.forceSelection(
          EditorState.createWithContent( convertFromRaw( notes[noteId].contents ), createLocalDecorator() ),
          editorStates[editorFocus].getSelection()
        )
        : EditorState.createWithContent( convertFromRaw( notes[noteId].contents ), createLocalDecorator() )
  };
}, {
  [sectionId]: mainEditorState
} );

/**
 * update a js entity reference
 * @param {object} entity - js-converted draft entity
 * @param {string} newReferenceId - new id to attribute
 * @return {object} updatedEntity
 */
const updateEntityReferenceId = ( entity, newReferenceId ) => {
  if ( isEntityAContextualizationReference( entity ) ) {
    return {
      ...entity,
      data: {
        ...entity.data,
        asset: {
          ...entity.data.asset,
          id: newReferenceId
        }
      }
    };
  }
 else if ( isEntityANoteReference( entity ) ) {
    return {
      ...entity,
      data: {
        ...entity.data,
        noteId: newReferenceId
      }
    };
  }
  else return entity;
};

/**
 * Update map of copied entities by ids
 * @return {object} entitiesMap
 */
export const updateCopiedEntitiesMap = ( {
  copiedEntities,
  notesIdTransformationMap,
  // contextualizationsIdTransformationMap,
  editorFocus,
  contentId,
  copiedNotes,
} ) => {
  const finalResult = Object.keys( copiedEntities )
  .reduce( ( result, id ) => {

    // const newEntities = copiedEntities[contentId];
    const newEntities = copiedEntities[id];

    /*
     * possibly transform copiedEntities map so that the target
     * of main copied contents is followed
     * (if it was copied from note to main editor, or from main editor to note
     * then we have to modify the entities map to target appropriate contents)
     */
    if ( id !== 'main' ) {

      /*
       * looking for note pointers that were attached
       * to the original copied note in order to update them
       * with the newly given note id
       */
      const newNoteId = notesIdTransformationMap[id];

      /*
       * if the target note is a "ghost" one
       * (i.e. linked to an old note id), attribute correct id
       */
      if ( newNoteId && copiedNotes[newNoteId] ) {
        return {
          ...result,
          [newNoteId]: newEntities
        };
      }
      else {
        return result;
      }
    }
    return result;
  }, {
    [editorFocus]: copiedEntities[contentId]
  } );
  return finalResult;
};

/**
 * Update draft entities js representation with proper
 * notes references and contextualizations references
 * return {object}
 */
export const updateCopiedEntities = ( {
  inputCopiedEntities,
  notesIdTransformationMap,
  contextualizationsIdTransformationMap,

  /*
   * contextualizationsIdTransformationReverseMap,
   * copiedContextualizations,
   */
} ) => {
  const invalidEntities = [];
  const outputCopiedEntities = Object.keys( inputCopiedEntities )
  .reduce( ( result, contentId ) => {
    const newEntities = inputCopiedEntities[contentId]

    /**
     * filter out invalid entities
     */
    .filter( ( entity ) => {
      // verifying that asset points to an existing contextualization
      if ( isEntityAContextualizationReference( entity.entity ) ) {
        const thatData = entity.entity.data;
        const isValid = contextualizationsIdTransformationMap[entity.entity.data.asset.id] !== undefined;
        if ( !isValid ) {
          invalidEntities.push( thatData.asset.id );
        }
        return isValid;
      }
      return true;
    } )

    /*
     * update entities data with correct notes and contextualizations ids pointers
     * iterate through copied contents
     */
    .map( ( inputEntity ) => {
      const entity = { ...inputEntity };
      const thatData = entity.entity.data;
      // case: copying note entity
      if ( isEntityANoteReference( entity.entity ) ) {
        const newNoteId = notesIdTransformationMap[thatData.noteId];
        if ( newNoteId ) {
          // attributing new id
          return {
            ...entity,
            entity: updateEntityReferenceId( entity.entity, newNoteId )
          };
        }
      }
      // case: copying asset entity
      else if ( isEntityAContextualizationReference( entity.entity ) ) {
        const newContextualizationId = contextualizationsIdTransformationMap[thatData.asset.id];
        if ( newContextualizationId ) {
          return {
            ...entity,
            entity: updateEntityReferenceId( entity.entity, newContextualizationId )
          };
        }
      }
      return entity;
    } );
    return {
      ...result,
      [contentId]: newEntities
      };
    }, {} );
  return {
    invalidEntities,
    outputCopiedEntities,
  };
};

/**
 * updates entities annotations in a given clipboard
 * @todo find a less performance-expensive way to do this
 * return {DraftBlocksMap} updatedClipboard
 */
export const cleanClipboardFromInvalidEntities = ( {
  invalidEntities,
  clipboard,
  newContentState,
  editorFocus
} ) => {
  return clipboard
  .filter( ( block ) => {
    if ( editorFocus !== 'main' ) {
      return block.getType() !== 'atomic';
    }
    return true;
  } )
  .map( ( block ) => {
    const characters = block.getCharacterList();
    const newCharacters = characters.map( ( char ) => {
      if ( char.getEntity() ) {
        const thatEntityKey = char.getEntity();
        const thatEntity = newContentState.getEntity( thatEntityKey ).toJS();
        // if entity is a contextualization reference
        if ( isEntityAContextualizationReference( thatEntity ) ) {
          const targetContextualizationId = thatEntity && thatEntity.data.asset.id;
          // and if the contextualization reference is invalid
          if ( invalidEntities.length > 0 && invalidEntities.includes( targetContextualizationId ) ) {
            // then we remove the entity from the character data
            return CharacterMetadata.applyEntity( char, null );
          }
        // remove note pointers if target is a note
        }
        else if ( isEntityANoteReference( thatEntity ) && editorFocus !== 'main' ) {
          return CharacterMetadata.applyEntity( char, null );
        }
      }
      return char;
    } );
    // we reset the content block characters list with cleaned character
    return block.set( 'characterList', newCharacters );
  } );
};

/**
 * update a clipboard contentState with proper
 * note references and contextualization references in its entities mentions
 * @todo the performance of this function could be improved
 * (lots of quadratic operations)
 * return {DraftBlocksMap} updatedClipboard
 */
export const updateClipboard = ( {
  clipboard,
  editorFocus,
  editorStates,
  copiedEntities,
  activeSectionId,
  notesIdTransformationReverseMap,
  contextualizationsIdTransformationMap,
} ) => {
  const entities = copiedEntities[editorFocus] || [];
  const editorStateId = editorFocus === 'main' ? activeSectionId : editorFocus;
  const editorState = editorStates[editorStateId];

  let newClipboard = clipboard;

  entities.forEach( ( entity ) => {
    let newContentState = editorState.getCurrentContent();
    newContentState = newContentState.createEntity( entity.entity.type, entity.entity.mutability, { ...entity.entity.data } );
    const newEntityKey = newContentState.getLastCreatedEntityKey();

    newClipboard = newClipboard.map( ( block ) => {
      const characters = block.getCharacterList();
      // iterate through each character
      const newCharacters = characters.map( ( char ) => {
        // if character has an entity
        if ( char.getEntity() ) {
          const thatEntityKey = char.getEntity();
          const thatEntity = newContentState.getEntity( thatEntityKey ).toJS();
          // update note reference
          if ( isEntityANoteReference( entity.entity ) && isEntityANoteReference( thatEntity ) ) {

            const entityNoteId = entity.entity.data.noteId;
            const newNoteOldId = notesIdTransformationReverseMap[entityNoteId];

            if ( newNoteOldId === thatEntity.data.noteId ) {
              return CharacterMetadata.applyEntity( char, newEntityKey );
            }
          }
          // update contextualization reference
          else if ( isEntityAContextualizationReference( entity.entity ) && isEntityAContextualizationReference( thatEntity ) ) {
            const targetId = thatEntity && thatEntity.data.asset.id;
            // const contextualizationOldId = contextualizationsIdTransformationReverseMap[targetId];
            if ( contextualizationsIdTransformationMap[targetId] === entity.entity.data.asset.id ) {
              return CharacterMetadata.applyEntity( char, newEntityKey );
            }
          }
        }

        return char;
      } );
      return block.set( 'characterList', newCharacters ); // block;
    } );
  } );

  return newClipboard;
};

/**
 * Handle synchronously all the data computing
 * necessary to update a section state by an internal pasting
 * @param {object}
 * @return {object} updatedElements - elements ready to be updated upstream
 */
export const computePastedData = ( {
  copiedData,
  copiedResources,
  editorFocus,
  editorStates,
  activeSection,
  NotePointer: NotePointerComponent,
  inlineEntities,
  inlineAssetComponents,
  contextualizations,
  editor,
  notes,
  story
} ) => {
  const activeSectionId = activeSection.id;
  let newClipboard = convertFromRaw( copiedData.clipboardContentState ).getBlockMap();// clipboard entities will have to be updated
  const data = copiedData;

  // const invalidEntities = [];
  let resourcesToCreate = [];
  let newNotes;
  // transformation maps : keys are old ids, values are new ids
  const contextualizersIdTransformationMap = {};
  const contextualizationsIdTransformationMap = {};
  const notesIdTransformationMap = {};

  // reverse transformation maps: keys are new ids, values are old ids
  let contextualizationsIdTransformationReverseMap = {};
  let notesIdTransformationReverseMap = {};

  let newContextualizations;
  let newContextualizers;

  const createLocalDecorator = () => {
    return editor ?
     editor.mainEditor.createLocalDecorator()
     : createDecorator( {
      NotePointerComponent: NotePointerComponent || NotePointer,
      findInlineAsset: ( contentBlock, callback, inputContentState ) => findInlineAsset(
        contentBlock,
        callback,
        inputContentState,
        {
          assets: contextualizations || {},
          renderingMode: 'web',
          inlineAssetComponents,
        } ),
      findNotePointer,
      findQuotes,
      InlineAssetContainerComponent: InlineAssetContainer,
      QuoteContainerComponent: QuoteContainer,
      inlineEntities, /* [{strategy: function, entity: component}] */
    } );
  };

  /*
   * filter out contextualizations that point to a resource that is not available anymore
   * (possible cases : other story, resource deleted,...)
   */
  const {
    filteredContextualizations: newCopiedContextualizations,
    resourcesToCreate: newResourcesToCreate = [],
    filteredContextualizers: newCopiedContextualizers,
  } = filterInvalidContextualizations( {
    contextualizationsList: data.copiedContextualizations,
    contextualizersList: data.copiedContextualizers,
    storyResources: story.resources,
    copiedResources,
  } );
  newContextualizations = newCopiedContextualizations;
  resourcesToCreate = [ ...resourcesToCreate, ...newResourcesToCreate ];
  newContextualizers = newCopiedContextualizers;

  /*
   * if target is a note, then filter out all block contextualizations
   * (because we do not allow them when directly modifying content)
   */
  if ( editorFocus !== 'main' ) {
    newContextualizations = removeBlockContextualizationsFromCopiedData( {
      contextualizationsList: newContextualizations,
      contextualizersList: newContextualizers,
    } );
    newContextualizers = newContextualizers.filter( ( contextualizer ) => {

      /**
       *  @todo find a way to go around this quadratic operation (a map of new contextualizations ?)
       */
      const hasContextualization = newContextualizations.find( ( contextualization ) => contextualizer.id === contextualization.contextualizerId );
      return hasContextualization !== undefined;
    } );
  }

  /**
   * transform contextualizers by attributing them a new id
   */
  if ( newContextualizers ) {
    newContextualizers = newContextualizers.map( ( thatContextualizer ) => {
      const contextualizerId = generateId();
      // modify contextualization with updated contextualizer id
      contextualizersIdTransformationMap[thatContextualizer.id] = contextualizerId;
      return {
          ...thatContextualizer,
          id: contextualizerId
        };
    } );
  }

  /**
   * transform contextualizations by attributing them a new id
   * and updating their contextualizer reference
   */
  if ( newContextualizations ) {
    newContextualizations = newContextualizations.map( ( thatContextualization ) => {
      const contextualizationId = generateId();
      // modify contextualization with updated contextualizer id
      contextualizationsIdTransformationMap[thatContextualization.id] = contextualizationId;
      return {
          ...thatContextualization,
          // use new contextualizer id
          contextualizerId: contextualizersIdTransformationMap[thatContextualization.contextualizerId],
          sectionId: activeSection.id,
          id: contextualizationId
        };
    } );
    contextualizationsIdTransformationReverseMap = reverseMap( contextualizationsIdTransformationMap );
  }

  /**
   * HANDLING NOTES PASTING
   */

  /*
   * now we attribute to new notes a new id (to handle possible duplicates)
   * and filter out invalid draft-js entities
   */
  let copiedNotes;
  let unusedContextualizationsIds = [];
  if ( editorFocus === 'main' ) {
      copiedNotes = ( data.copiedNotes || [] ).reduce( ( result, note ) => {
      const noteNewId = generateId();
      notesIdTransformationMap[note.id] = noteNewId;
      return {
        ...result,
        [noteNewId]: {
          ...note,
          id: noteNewId
        }
      };
    }, {
      // ...notes
    } );
    notesIdTransformationReverseMap = reverseMap( notesIdTransformationMap );

  /**
   * If target is not main we flush the additionnal copied notes
   * because they won't be copied
   */
  }
  else {

    /**
     * we find contextualizations in the copied notes and filter them out
     */
    unusedContextualizationsIds = data.copiedNotes.reduce( ( result, note ) => {
      const entities = Object.keys( note.contents.entityMap ).map( ( key ) => note.contents.entityMap[key] );
      return [
        ...result,
        ...entities.filter( ( entity ) => isEntityAContextualizationReference( entity ) ).map( ( e ) => e.data.asset.id )
      ];
    }, [] )
    .reduce( ( res, id ) => ( {
      ...res, [id]: id
    } ), {} );

     newContextualizations = newContextualizations.filter( ( thisContextualization ) => {
       const contextualizationId = contextualizationsIdTransformationReverseMap[thisContextualization.id];
       if ( contextualizationId && unusedContextualizationsIds[contextualizationId] ) {
        // const contextualizerToRemove = newContextualizers.find( ( thatContexgtualizer ) => thatContexgtualizer.id === thisContextualization.contextualizerId );
        newContextualizers = newContextualizers.filter( ( thatContexgtualizer ) => thatContexgtualizer.id !== thisContextualization.contextualizerId );
        //  console.log( 'contextualizer to remove', contextualizerToRemove );
        /**
         * @todo delete related contextualizers
         */
        delete contextualizationsIdTransformationMap[contextualizationsIdTransformationReverseMap[contextualizationId]];
        delete contextualizationsIdTransformationReverseMap[contextualizationId];
        return false;
      }
      return true;
    } );

    copiedNotes = ( data.copiedNotes || [] ).reduce( ( result, note ) => ( {
      ...result,
      [note.id]: note
    } ), {} );
  }

  /**
   * filter out resources that might not be to create anymore (e.g. related to filtered out contextualizations)
   */
  if ( unusedContextualizationsIds.length ) {
    resourcesToCreate = resourcesToCreate.filter( ( resource ) => {
      const resourceId = resource.id;
      const stillHasContextualizations = newContextualizations.find( ( thatContextualization ) => thatContextualization.resourceId === resourceId );
      if ( stillHasContextualizations ) {
        return true;
      }
      return false;
    } );
  }

  /**
   * UPDATE DRAFT ENTITIES INSIDE THE COPIED CONTENTS
   * (note references, contextualization references)
   */
  /**
   * update map of copied entities
   */
  let newCopiedEntities = updateCopiedEntitiesMap( {
    copiedEntities: data.copiedEntities,
    notesIdTransformationMap,
    editorFocus,
    contentId: data.contentId,
    copiedNotes,
  } );

  /**
   * update copied entities data
   * with proper contextualizations and notes ids
   */
  const {
    invalidEntities,
    outputCopiedEntities,
  } = updateCopiedEntities( {
    inputCopiedEntities: newCopiedEntities,
    notesIdTransformationMap,
    contextualizationsIdTransformationMap,
    contextualizationsIdTransformationReverseMap,
    copiedContextualizations: newContextualizations,
  } );
  newCopiedEntities = outputCopiedEntities;

  const notesToUpdate = copiedNotes;
  if ( editorFocus !== 'main' ) {
    notesToUpdate[editorFocus] = { ...notes[editorFocus] };
  }

  /**
   * filter invalid draft-js entities from notes contents
   */
  newNotes = Object.keys( notesToUpdate ).reduce( ( result, noteId ) => {
    const note = notesToUpdate[noteId];
     return {
       ...result,
       [noteId]: {
         ...note,
         // filter invalid entities in copied notes
         contents: {
           ...note.contents,
           entityMap: Object.keys( note.contents.entityMap ).reduce( ( res, entityKey ) => {
             const entity = note.contents.entityMap[entityKey];
             if (
               // IF there are no invalid entities
               invalidEntities.length === 0 ||
               // ELSE IF entity is a note pointer
                isEntityANoteReference( entity ) ||
                // ELSE IF if the targeted asset is not invalid
               (
                isEntityAContextualizationReference( entity )
                && !invalidEntities.includes( entity.data.asset.id )
               )

            ) {
              if ( newCopiedEntities[noteId] ) {
                  const newEntity = newCopiedEntities[noteId].find( ( thatEntity ) => {
                    if ( isEntityAContextualizationReference( thatEntity.entity ) ) {
                      return thatEntity.entity.data.asset.id === contextualizationsIdTransformationMap[entity.data.asset.id];
                    }
                    return false;
                  } );
                  if ( newEntity ) {
                    // THEN we accept this entity in new notes contents
                    return {
                      ...res,
                      [entityKey]: newEntity && { ...newEntity.entity }, // note.contents.entityMap[entityKey]
                    };
                  }
                  return {
                    ...res,
                    [entityKey]: note.contents.entityMap[entityKey]
                  };
              }

               return res;
             }
             // ELSE we don't
             return res;
           }, {} )
         },
         id: noteId
       }
     };
   }, {} );

  /*
   * integrate new draftjs entities in respective editorStates.
   * reminder : editorStates are stored as a map in which each keys corresponds
   * to a category of content ('main' for main contents or uuids for each note)
   */
  let newContentState;

  /*
   * explanation about realEditorFocus : editor focus is related to live state in which the main editor state is represented in a 'main' key
   * while in contents map main editor state is represented by the section id
   */
  const realEditorFocus = editorFocus === 'main' ? activeSectionId : editorFocus;
  newContentState = editorStates[realEditorFocus].getCurrentContent();

  /**
   * UPDATE THE CLIPBOARD OBJECT
   */
  /*
   * cleaning the clipboard of invalid entities
   * (invalid contextualizations pointers, notes pointers if target is a note)
   */
  newClipboard = cleanClipboardFromInvalidEntities( {
    invalidEntities,
    newContentState,
    clipboard: newClipboard,
    editorFocus,
  } );

  /**
   * Update clipboard with proper entities references
   */
  newClipboard = updateClipboard( {
    clipboard: newClipboard,
    editorFocus,
    editorStates,
    copiedEntities: newCopiedEntities,
    activeSectionId,
    notesIdTransformationReverseMap,
    contextualizationsIdTransformationMap,
  } );

  /**
   * ADD COPIED ENTITIES TO THE NEW NOTES EDITOR STATES
   */
  Object.keys( newCopiedEntities ).forEach( ( contentId ) => {

    /*
     * iterating through a note's editor's copied entities
     * to update its entities and the clipboard
     */
    if ( newNotes[contentId] ) {
      let thatEditorState = editorStates[contentId]
        || EditorState.createWithContent(
            convertFromRaw( newNotes[contentId].contents ),
            createLocalDecorator()
          );

      /**
       * Rebuild the editor state of the note
       * for each copied entity
       */
      newCopiedEntities[contentId].forEach( ( entity ) => {
        newContentState = thatEditorState.getCurrentContent();
        newContentState = newContentState.createEntity( entity.entity.type, entity.entity.mutability, { ...entity.entity.data } );
        // update related entity in content
        newContentState.getBlockMap().map( ( block ) => {
          block.getCharacterList().map( ( char ) => {
            if ( char.getEntity() ) {
              const ent = newContentState.getEntity( char.getEntity() );
              const entJS = ent.toJS();
              const eData = ent.getData();
              if ( isEntityAContextualizationReference( entity.entity ) && isEntityAContextualizationReference( entJS ) ) {
                const oldContextualizationId = contextualizationsIdTransformationReverseMap[entity.entity.data.asset.id];
                if ( eData.asset && eData.asset.id && entity.entity.data.asset && eData.asset.id === oldContextualizationId ) {
                  newContentState = newContentState.mergeEntityData( char.getEntity(), {
                    ...entity.entity.data
                  } );
                }
              }
            }
          } );
        } );
        thatEditorState = EditorState.push(
            thatEditorState,
            newContentState,
            'create-entity'
          );
      } );

      /*
       * updating raw contents of the notes
       * from the new content state
       */
      newNotes[contentId].contents = convertToRaw(
        thatEditorState.getCurrentContent()
      );
    }
  } );

  let mainEditorState = editorStates[activeSectionId];
  let notesOrder = activeSection.notesOrder;

  /**
   * PUSH CLIPBOARD CONTENTS TO RELATED EDITOR STATE
   */

  /*
   * IF pasting target is the main editor
   * THEN we update the main editor with clipboard contents
   * an duplicate notes accordingly
   */
  if ( editorFocus === 'main' ) {
    mainEditorState = insertFragment( mainEditorState, newClipboard );
    // updating the notes order & co. from the editor state
    const { newNotes: newNewNotes, notesOrder: newNotesOrder } = updateNotesFromEditor( mainEditorState, { ...notes, ...newNotes } );
    newNotes = newNewNotes;
    notesOrder = newNotesOrder;
  }

  /*
   * ELSE IF pasting target is a note editor
   * then update the related note with clipboard contents
   */
  else {
    mainEditorState = EditorState.createWithContent( mainEditorState.getCurrentContent(), createLocalDecorator() );
    const noteEditorState = editorStates[editorFocus];
    newNotes = {
      ...notes,
      ...newNotes,
      [editorFocus]: {
        ...newNotes[editorFocus],
        contents: convertToRaw(
          insertFragment( noteEditorState, newClipboard )
          .getCurrentContent()
        )
      }
    };
  }

  /**
   * rebuild the editor states map
   */
  const newEditorStates = createEditorStatesMap( {
    mainEditorState,
    sectionId: activeSectionId,
    editorStates,
    editorFocus,
    notes: newNotes,
    editor,
    createLocalDecorator,
  } );

  /**
   * rebuild the whole section serializable representation
   */
  const newSection = {
      ...activeSection,
      contents: convertToRaw( mainEditorState.getCurrentContent() ),
      notesOrder,
      notes: newNotes,
    };

  /**
   * THAT'S ALL FOLKS ;)
   */
  return {
    resourcesToCreate,
    contextualizersToCreate: newContextualizers,
    contextualizationsToCreate: newContextualizations,
    newSection,
    newEditorStates,
  };
};

/**
 * Handle the pasting operation and related actions triggering
 */
const pasteFromInside = ( {
  updateSection,
  createContextualization,
  createContextualizer,
  createResource,
  uploadResource,
  userId,
  updateDraftEditorsStates,
  updateSectionRawContent,

  activeSection,
  storyId,
  editorFocus,
  setEditorPastingStatus,
  setEditorFocus,

  story,
  editor,
  notes,
  editorStates,
  // copiedData,
  html = '',
  dataRegex,

  NotePointer: NotePointerComponent,
  inlineEntities,
  inlineAssetComponents,
} ) => {

  /**
   * Retrieve copied resources from local storage
   * (this technique is used to allow pasting of resources that have been deleted since the copying operation happened)
   */
  const copiedResources = retrieveCopiedResources();

  /**
   * try to extract from clipboard data
   * a json object containing all complex copied object
   * (refer to handleCopy utils to know about it)
   */
  const copiedData = extractCopiedData( html, dataRegex );

  // no json data -> draft can do the job, we let it handle the pasting
  if ( !copiedData ) {
    return false;
  }

  /**
   * From there we will handle complex pasting operations (involving contextualizations and/or notes)
   */
  setEditorPastingStatus( {
    status: 'duplicating-contents',
  } );

  /**
   * Wrapping operations in a setTimeout allows the pasting modal to display
   */
  setTimeout( () => {
    if ( typeof copiedData !== 'object' ) {
      return;
    }
    const {
      resourcesToCreate = [],
      contextualizersToCreate = [],
      contextualizationsToCreate = [],
      newSection,
      newEditorStates,
    } = computePastedData( {
      copiedData,
      copiedResources,
      editorFocus,
      editorStates,
      activeSection,
      NotePointerComponent,
      inlineEntities,
      inlineAssetComponents,
      contextualizations: story.contextualizations,
      editor,
      notes,
      story
    } );

    Promise.resolve()
    .then( () => new Promise( ( resolve, reject ) => {
      Promise.resolve()

        /**
         * Create missing resources
         */
        .then( () => new Promise( ( res1, rej1 ) => {
          return resourcesToCreate.reduce( ( cur, resource ) => {
            return cur.then( () => new Promise( ( res2, rej2 ) => {
              switch ( resource.metadata.type ) {
                case 'image':
                case 'table':
                  uploadResource( {
                    storyId,
                    userId,
                    resourceId: resource.id,
                    resource
                  }, 'create', ( err ) => {
                    if ( err ) {
                      rej2( err );
                    }
                    else {
                      res2();
                    }
                  } );
                  break;
                default:
                  createResource( {
                    storyId,
                    userId,
                    resourceId: resource.id,
                    resource
                  }, ( err ) => {
                    if ( err ) {
                      rej2( err );
                    }
                    else {
                      res2();
                    }
                  } );
                  break;
              }
            } ) );
          }, Promise.resolve() )
          .then( res1 )
          .catch( rej1 );
        } ) )

        /**
         * Create contextualizers
         */
        .then( () => new Promise( ( res1, rej1 ) => {
          // paste contextualizers (attributing them a new id)
          if ( contextualizersToCreate.length ) {
            setEditorPastingStatus( {
              status: 'duplicating-contextualizers',
              statusParameters: {
                length: contextualizersToCreate.length
              }
            } );
            contextualizersToCreate.reduce( ( cur, contextualizer ) => {
              return cur.then( () => new Promise( ( res2, rej2 ) => {

                createContextualizer( {
                  storyId,
                  contextualizerId: contextualizer.id,
                  contextualizer: { ...contextualizer, id: contextualizer.id }, userId
                }, ( err ) => {
                  if ( err ) {
                    rej2( err );
                  }
                  else res2();
                } );

              } ) );

            }, Promise.resolve() )
            .then( () => res1() )
            .catch( rej1 );
          }
          else res1();
        } ) )

        /**
         * Create contextualizations
         */
        .then( () => new Promise( ( res1, rej1 ) => {
          // paste assets/contextualizations (attributing them a new id)
          if ( contextualizationsToCreate.length ) {

            contextualizationsToCreate.reduce( ( cur, contextualization ) => {
              return cur.then( () => new Promise( ( res2, rej2 ) => {

                createContextualization( {
                  storyId,
                  contextualizationId: contextualization.id,
                  contextualization,
                  userId,
                }, ( err ) => {
                  if ( err ) {
                    rej2( err );
                  }
                  else res2();
                } );

              } ) );

            }, Promise.resolve() )
            .then( () => res1() )
            .catch( rej1 );
          }
          else res1();
        } ) )
        .then( resolve )
        .catch( reject );

    } ) )

    /*
     * resources and objects have been created,
     * now we update contents
     */
    .then( () => {

      // all done ! now we batch-update all the editor states ...
      setEditorPastingStatus( {
        status: 'updating-contents'
      } );
      setTimeout( () => {
        // update live editor states
        setEditorFocus( undefined );

        updateDraftEditorsStates( newEditorStates );
        // ...then update the section with editorStates convert to serializable raw objects
        updateSection( newSection, () => {
          setEditorFocus( editorFocus );
          updateSectionRawContent( editorFocus, storyId, newSection.id );
        } );
        setEditorPastingStatus( undefined );
      } );

    } )
    .catch( console.error );/* eslint no-console: 0 */
  } );
  return true;

};

export default pasteFromInside;
