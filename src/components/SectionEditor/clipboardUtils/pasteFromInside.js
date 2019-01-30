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
  constants
} from 'scholar-draft';

const {
  NOTE_POINTER,
  // SCHOLAR_DRAFT_CLIPBOARD_CODE,
  INLINE_ASSET,
  BLOCK_ASSET,
} = constants;

const {
  updateNotesFromEditor,
  insertFragment,
} = utils;

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
      const savedResource = copiedResources.find( ( resource ) => resource.id === contextualization.resourceId );
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

export const computePastedData = ( {
  copiedData,
  copiedResources,
  editorFocus,
  editorStates,
  activeSection,
  editor,
  notes,
  story
} ) => {
  const activeSectionId = activeSection.id;
  let newClipboard = convertFromRaw( copiedData.clipboardContentState ).getBlockMap();// clipboard entities will have to be updated
  const data = copiedData;

  const invalidEntities = [];
  let resourcesToCreate = [];
  let newNotes;
  const contextualizersIdTransformationMap = {};
  const contextualizationsIdTransformationMap = {};

  // filter out contextualizations that point to a resource that has been deleted
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
  data.copiedContextualizations = newCopiedContextualizations;
  resourcesToCreate = [ ...resourcesToCreate, ...newResourcesToCreate ];
  data.copiedContextualizers = newCopiedContextualizers;

  /*
   * if target is a note, then filter out all block contextualizations
   * (because we do not allow them when directly modifying content)
   */
  if ( editorFocus !== 'main' ) {
    data.copiedContextualizations = removeBlockContextualizationsFromCopiedData( {
      contextualizationsList: data.copiedContextualizations,
      contextualizersList: data.copiedContextualizers,
    } );
  }

  /**
   * transform contextualizers by attributing them a new id
   */
  if ( data.copiedContextualizers ) {
    data.copiedContextualizers = data.copiedContextualizers.map( ( thatContextualizer ) => {
      const contextualizerId = generateId();
      // modify contextualization with updated contextualizer id
      contextualizersIdTransformationMap[thatContextualizer.id] = contextualizerId;
      return {
          ...thatContextualizer,
          oldId: thatContextualizer.id,
          id: contextualizerId
        };
    } );
  }

  /**
   * transform contextualizations
   */
  if ( data.copiedContextualizations ) {
    data.copiedContextualizations = data.copiedContextualizations.map( ( thatContextualization ) => {
      const contextualizationId = generateId();
      // modify contextualization with updated contextualizer id
      contextualizationsIdTransformationMap[thatContextualization.id] = contextualizationId;
      return {
          ...thatContextualization,
          // use new contextualizer id
          contextualizerId: contextualizersIdTransformationMap[thatContextualization.contextualizerId],
          // store old id for later
          oldId: thatContextualization.id,
          id: contextualizationId
        };
    } );
  }

  // filter out entities that are related to incorrect contextualizations
  data.copiedEntities = Object.keys( data.copiedEntities )
  .reduce( ( result, contentId ) => {
    return {
      ...result,
      [contentId]: data.copiedEntities[contentId]
        .filter( ( entity ) => {

          const thatData = entity.entity.data;
          // verifying that asset points to a contextualization
          if ( thatData.asset && thatData.asset.id ) {
            const thatContextualization = data.copiedContextualizations.find( ( thisContextualization ) => thisContextualization.oldId === thatData.asset.id );
            const isValid = thatContextualization !== undefined;
            if ( !isValid ) {
              invalidEntities.push( thatData.asset.id );
            }
            return isValid;
          }
          return true;
        } )
      };
    }, {} );

  /*
   * retargeting main editor source
   * (if it was copied from note to main editor, or from main editor to note)
   */
  if ( data.contentId !== editorFocus ) {
    data.copiedEntities[editorFocus] = data.copiedEntities[data.contentId];
    delete data.copiedEntities[data.contentId];
  }

  /**
   * HANDLING NOTES PASTING
   */
  // paste notes (attributing them a new id to duplicate them if in situation of copy/paste)
  if ( data.copiedNotes && editorFocus === 'main' ) {

    /*
     * we have to convert existing notes contents
     * as EditorState objects to handle pasting and new notes
     * the same way
     */
    const pastNotes = Object.keys( notes ).reduce( ( result, noteId ) => {
      return {
        ...result,
        [noteId]: {
          ...notes[noteId],
          // contents: EditorState.createWithContent(convertFromRaw(notes[noteId].contents), editor.mainEditor.createDecorator()),
        }
      };
    }, {} );

    /*
     * now we attribute to new notes a new id (to handle possible duplicates)
     * and merge them with the past notes
     */
    newNotes = data.copiedNotes.reduce( ( result, note ) => {
      const id = generateId();
      return {
        ...result,
        [id]: {
          ...note,
          oldId: note.id,
          // filter out invalid entities in copied notes
          contents: {
            ...note.contents,
            entityMap: Object.keys( note.contents.entityMap ).reduce( ( res, entityKey ) => {
              const entity = note.contents.entityMap[entityKey];
              const assetId = entity.data && entity.data.asset && entity.data.asset.id;
              if ( entity.type === NOTE_POINTER || !assetId || invalidEntities.length === 0 || !invalidEntities.includes( assetId ) ) {
                return {
                  ...res,
                  [entityKey]: note.contents.entityMap[entityKey]
                };
              }
              return res;
            }, {} )
          },
          id
        }
      };
    }, {
      ...pastNotes
    } );

    /*
     * we now have to update copied entities targets
     * for entities stored in pasted notes
     */
    data.copiedEntities = Object.keys( data.copiedEntities )

    /*
     * reminder : copiedEntities is a map of editors (main + notes)
     * that have been copied.
     * We therefore iterate in this map
     */
    .reduce( ( result, id ) => {

      /*
       * we are interested in updating only the entities in the main
       * because it is only there that there are note pointers entities
       */
      if ( id !== 'main' ) {

        /*
         * looking for note pointers that were attached
         * to the original copied note in order to update them
         * with the newly given note id
         */
        const noteId = Object.keys( newNotes )
          .find( ( thatNoteId ) => {
            const note = newNotes[thatNoteId];
            return note.oldId === id;
          } );

        /*
         * if the target note is a "ghost" one
         * (i.e. linked to an old note id), attribute correct id
         */
        if ( noteId && newNotes[noteId].oldId ) {
          // console.info('reattributing entity to note id', newNotes[noteId].id);
          return {
            ...result,
            [newNotes[noteId].id]: data.copiedEntities[newNotes[noteId].oldId]
          };
        }
      }
      return {
        ...result,
        [id]: data.copiedEntities[id]
      };
    }, {} );
  }
  else {
    newNotes = notes;
  }

  /*
   * integrate new draftjs entities in respective editorStates
   * editorStates are stored as a map in which each keys corresponds
   * to a category of content ('main' for main contents or uuids for each note)
   */
  if ( Object.keys( data.copiedEntities ).length ) {

    // update entities data with correct notes and contextualizations ids pointers
    const copiedEntities = Object.keys( data.copiedEntities )
    .reduce( ( result, contentId ) => {
      return {
        ...result,
        [contentId]: data.copiedEntities[contentId]
          .map( ( inputEntity ) => {
          const entity = { ...inputEntity };
          const thatData = entity.entity.data;
          // case: copying note entity
          if ( thatData && thatData.noteId ) {
            const id = Object.keys( newNotes ).find( ( key ) => {
              if ( newNotes[key].oldId === thatData.noteId ) {
                return true;
              }
            } );
            if ( id ) {
              // attributing new id
              return {
                ...entity,
                entity: {
                  ...entity.entity,
                  data: {
                    ...thatData,
                    noteId: id
                  }
                }
              };
            }
          }
          // case: copying asset entity
          else if ( thatData.asset && thatData.asset.id ) {
            let id = Object.keys( copiedData.copiedContextualizations ).find( ( key ) => {
              if ( copiedData.copiedContextualizations[key].oldId === thatData.asset.id ) {
                return true;
              }
            } );
            if ( id ) {
              id = copiedData.copiedContextualizations[id].id;
            }
            if ( id ) {
              return {
                ...entity,
                entity: {
                  ...entity.entity,
                  data: {
                    ...entity.entity.data,
                    asset: {
                      ...entity.entity.data.asset,
                      oldId: entity.entity.data.asset.id,
                      id
                    }
                  }
                }
              };
            }
          }
          return entity;
        } )
      };
    }, {} );

    let newContentState;

    const realEditorFocus = editorFocus === 'main' ? activeSectionId : editorFocus;
    newContentState = editorStates[realEditorFocus].getCurrentContent();
    // cleaning the clipboard of invalid entities
    newClipboard = newClipboard.map( ( block ) => {
      const characters = block.getCharacterList();
      const newCharacters = characters.map( ( char ) => {
        if ( char.getEntity() ) {
          const thatEntityKey = char.getEntity();
          const thatEntity = newContentState.getEntity( thatEntityKey ).toJS();
          if ( thatEntity.type === BLOCK_ASSET || thatEntity.type === INLINE_ASSET ) {
            const targetId = thatEntity && thatEntity.data.asset.id;

            if ( invalidEntities.length > 0 && invalidEntities.includes( targetId ) ) {
              return CharacterMetadata.applyEntity( char, null );
            }
          }
        }
        return char;
      } );
      return block.set( 'characterList', newCharacters ); // block;
    } );

    // iterating through all the entities and adding them to the new editor states
    Object.keys( copiedEntities ).forEach( ( contentId ) => {
        copiedEntities[contentId].forEach( ( entity ) => {
          // if (contentId === editorFocus) {
            const eId = contentId === 'main' ? activeSectionId : editorFocus;
            const editorState = editorStates[eId];

            if ( !editorState ) {
              return;
            }

            newContentState = editorState.getCurrentContent();
            newContentState = newContentState.createEntity( entity.entity.type, entity.entity.mutability, { ...entity.entity.data } );

            const newEntityKey = newContentState.getLastCreatedEntityKey();
            // updating the related clipboard
            newClipboard = newClipboard.map( ( block ) => {
              const characters = block.getCharacterList();
              const newCharacters = characters.map( ( char ) => {
                if ( char.getEntity() ) {
                  const thatEntityKey = char.getEntity();
                  const thatEntity = newContentState.getEntity( thatEntityKey ).toJS();
                  if ( entity.entity.type === NOTE_POINTER && thatEntity.type === NOTE_POINTER ) {
                    if ( contentId !== 'main' ) {
                      return CharacterMetadata.applyEntity( char, null );
                    }
                    const entityNoteId = entity.entity.data.noteId;
                    const newNoteOldId = newNotes[entityNoteId] && newNotes[entityNoteId].oldId;
                    if ( newNoteOldId === thatEntity.data.noteId ) {
                      return CharacterMetadata.applyEntity( char, newEntityKey );
                    }
                  }
                  else if ( ( entity.entity.type === BLOCK_ASSET || entity.entity.type === INLINE_ASSET ) && ( thatEntity.type === BLOCK_ASSET || thatEntity.type === INLINE_ASSET ) ) {
                    const targetId = thatEntity && thatEntity.data.asset.id;
                    if ( invalidEntities.length > 0 && invalidEntities.includes( targetId ) ) {
                      return CharacterMetadata.applyEntity( char, null );
                    }
                    else if ( targetId === entity.entity.data.asset.oldId ) {
                      return CharacterMetadata.applyEntity( char, newEntityKey );
                    }
                  }
                }

                return char;
              } );
              return block.set( 'characterList', newCharacters ); // block;
            } );
          // }
        } );

      /*
       * iterating through a note's editor's copied entities
       * to update its entities and the clipboard
       */
      if ( newNotes[contentId] ) {
        copiedEntities[contentId].forEach( ( entity ) => {
          const editorState = editorStates[contentId]
            || EditorState.createWithContent(
                convertFromRaw( newNotes[contentId].contents ),
                editor.mainEditor.createDecorator()
              );
          newContentState = editorState.getCurrentContent();
          newContentState = newContentState.createEntity( entity.entity.type, entity.entity.mutability, { ...entity.entity.data } );
          // update related entity in content
          newContentState.getBlockMap().map( ( block ) => {
            block.getCharacterList().map( ( char ) => {
              if ( char.getEntity() ) {
                const ent = newContentState.getEntity( char.getEntity() );
                const eData = ent.getData();
                if ( eData.asset && eData.asset.id && entity.entity.data.asset && eData.asset.id === entity.entity.data.asset.oldId ) {
                  newContentState = newContentState.mergeEntityData( char.getEntity(), {
                    ...entity.entity.data
                  } );
                }
              }
            } );
          } );
          newNotes[contentId].contents = convertToRaw( EditorState.push(
            editorState,
            newContentState,
            'create-entity'
          ).getCurrentContent() );
          const newEntityKey = newContentState.getLastCreatedEntityKey();
          newClipboard = newClipboard.map( ( block ) => {
            const characters = block.getCharacterList();
            const newCharacters = characters.map( ( char ) => {
              const thatEntityKey = char.getEntity();
              if ( thatEntityKey ) {
                const thatEntity = newContentState.getEntity( thatEntityKey ).toJS();
                if ( thatEntity.type === BLOCK_ASSET || thatEntity.type === INLINE_ASSET ) {
                  const targetId = thatEntity.data.asset.id;
                  if ( invalidEntities.length > 0 && invalidEntities.includes( targetId ) ) {
                    return CharacterMetadata.applyEntity( char, null );
                  }
                  else if ( thatEntityKey === entity.key ) {
                    return CharacterMetadata.applyEntity( char, newEntityKey );
                  }
                }
              }
              return char;
            } );
            return block.set( 'characterList', newCharacters ); // block;
          } );
        } );
      }
    } );
  }

  let mainEditorState = editorStates[activeSectionId];
      let notesOrder = activeSection.notesOrder;
      // case pasting target is the main editor
      if ( editorFocus === 'main' ) {
        mainEditorState = insertFragment( mainEditorState, newClipboard );

        const { newNotes: newNewNotes, notesOrder: newNotesOrder } = updateNotesFromEditor( mainEditorState, newNotes );
        newNotes = newNewNotes;
        notesOrder = newNotesOrder;
      }
      // case pasting target is a note editor
      else {
        const noteEditorState = editorStates[editorFocus];
        newNotes = {
          ...Object.keys( newNotes ).reduce( ( convertedNotes, noteId ) => {
            const note = newNotes[noteId];
            return {
              ...convertedNotes,
              [noteId]: {
                ...note,
              }
            };
          }, {} ),
          [editorFocus]: {
            ...newNotes[editorFocus],
            contents: convertToRaw(
              insertFragment( noteEditorState, newClipboard )
              .getCurrentContent()
            )
          }
        };
      }

      newNotes = Object.keys( newNotes ).reduce( ( result, noteId ) => {
        const note = newNotes[noteId];
        delete note.oldId;
        return {
          ...result,
          [noteId]: { ...note }
        };
      }, {} );
  const newEditorStates = Object.keys( newNotes ).reduce( ( editors, noteId ) => {
    return {
      ...editors,
      [noteId]: noteId === editorFocus ?
          EditorState.forceSelection(
            EditorState.createWithContent( convertFromRaw( newNotes[noteId].contents ), editor.mainEditor.createDecorator() ),
            editorStates[editorFocus].getSelection()
          )
          : EditorState.createWithContent( convertFromRaw( newNotes[noteId].contents ), editor.mainEditor.createDecorator() )
    };
  }, { [activeSectionId]: mainEditorState
  } );

  const newSection = {
      ...activeSection,
      contents: convertToRaw( mainEditorState.getCurrentContent() ),
      notesOrder,
      notes: {
        ...activeSection.notes,
        ...Object.keys( newNotes ).reduce( ( result, noteId ) => {
              return {
                ...result,
                [noteId]: {
                  ...newNotes[noteId],
                }
              };
            }, {} )
      }
    };

  return {
    resourcesToCreate,
    contextualizersToCreate: data.copiedContextualizers,
    contextualizationsToCreate: data.copiedContextualizations,
    newSection,
    newEditorStates,
  };
};

const pasteFromInside = ( {
  updateSection,
  createContextualization,
  createContextualizer,
  createResource,
  uploadResource,
  userId,
  updateDraftEditorsStates,

  activeSection,
  storyId,
  editorFocus,
  setEditorPastingStatus,

  story,
  editor,
  notes,
  editorStates,
  // copiedData,
  html = '',
  dataRegex,
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
        updateDraftEditorsStates( newEditorStates );
        // ...then update the section with editorStates convert to serializable raw objects
        updateSection( newSection );
        setEditorPastingStatus( undefined );
      } );

    } )
    .catch( console.error );/* eslint no-console: 0 */
  } );
  return true;

};

export default pasteFromInside;
