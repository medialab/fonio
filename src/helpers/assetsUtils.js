/**
 * This module provides utils related to the test and loading of assets' data
 * @module fonio/utils/assetsUtils
 */

import { get } from 'axios';
import exif from 'exif-js';

import { v4 as genId } from 'uuid';

import Cite from 'citation-js';

import {
  convertToRaw,
  Modifier,
  EditorState,
  SelectionState,
} from 'draft-js';

import {
  insertInlineContextualization,
  insertBlockContextualization,
  getTextSelection
} from './draftUtils';

import {
  constants
} from 'scholar-draft';
const {
  BLOCK_ASSET,
  INLINE_ASSET
} = constants;

/**
 * Checks whether a file is an image that can be loaded in base64 later on
 * todo: could be improved
 * @param {File} file - the file to check
 * @return {Promise} process - checking is wrapped in a promise for consistence matters
 */
export const fileIsAnImage = ( file ) => {
  return new Promise( ( resolve, reject ) => {
    const validExtensions = [ 'gif', 'png', 'jpeg', 'jpg' ];
    const extension = file.name.split( '.' ).pop();
    if ( validExtensions.includes( extension ) ) {
      resolve( file );
    }
    else {
      reject();
    }
  } );
};

/**
 * Checks whether a given url links toward a video service which is handled by the app
 * todo: could be improved
 * @param {string} url - the url to check
 * @return {Promise} process - checking is wrapped in a promise for consistence matters
 */
export const videoUrlIsValid = ( url ) => {
  return new Promise( ( resolve, reject ) => {
    const validUrlParts = [ 'youtu', 'vimeo' ];
    const hasMatch = validUrlParts.some( ( exp ) => url.match( exp ) !== null );
    if ( hasMatch ) {
      resolve( url );
    }
    else {
      reject();
    }
  } );
};

/**
 * Forces the orientation of a base64 image
 * @param {string} srcBase64 - base64 representation
 * @param {number} srcOrientation - exif orientation code
 */
const resetOrientation = ( srcBase64, srcOrientation ) => {
  return new Promise( ( resolve, reject ) => {
    const img = new Image();

    img.onload = function() {
      const width = img.width;
      const height = img.height;
      const canvas = document.createElement( 'canvas' );
      const ctx = canvas.getContext( '2d' );

      // set proper canvas dimensions before transform & export
      if ( srcOrientation > 4 && srcOrientation < 9 ) {
        canvas.width = height;
        canvas.height = width;
      }
      else {
        canvas.width = width;
        canvas.height = height;
      }

      // transform context before drawing image
      switch ( srcOrientation ) {
        case 2: ctx.transform( -1, 0, 0, 1, width, 0 ); break;
        case 3: ctx.transform( -1, 0, 0, -1, width, height ); break;
        case 4: ctx.transform( 1, 0, 0, -1, 0, height ); break;
        case 5: ctx.transform( 0, 1, 1, 0, 0, 0 ); break;
        case 6: ctx.transform( 0, 1, -1, 0, height, 0 ); break;
        case 7: ctx.transform( 0, -1, -1, 0, height, width ); break;
        case 8: ctx.transform( 0, -1, 1, 0, 0, width ); break;
        default: break;
      }

      // draw image
      ctx.drawImage( img, 0, 0 );

      // export base64
      resolve( canvas.toDataURL() );
    };

    img.src = srcBase64;
  } );

};

/**
 * Fetches exif data out of a base64-represented image
 */
const getExifOrientation = ( base64 ) => {
  return new Promise( ( resolve, reject ) => {
    const img = new Image();

    img.onload = function() {
      exif.getData( img, function() {
          const orientation = exif.getTag( this, 'Orientation' );
          if ( orientation ) {
            resolve( orientation );
          }
          else resolve();
      } );
    };

    img.src = base64;
  } );
};

/**
 * Loads an image file in base64
 * todo: could be improved
 * @param {File} file - the file to load
 * @return {Promise} process - loading is wrapped in a promise for consistence matters
 */
export const loadImage = ( file ) => {
  return new Promise( ( resolve, reject ) => {
    let reader = new FileReader();
    reader.onload = ( event ) => {
      const base64 = event.target.result;
      getExifOrientation( base64 )
      .then( ( orientation ) => {
        if ( orientation ) {
          return resetOrientation( base64, orientation );
        }
        else {
          return resolve( base64 );
        }
      } )
      .then( ( newBase64 ) => resolve( newBase64 ) )
      .catch( console.error ); /* eslint no-console : 0 */

      reader = undefined;
    };
    reader.onerror = ( event ) => {
      reject( event.target.error );
      reader = undefined;
    };
    reader.readAsDataURL( file );
  } );
};

/**
 * Loads a json data from static url
 * todo: could be improved
 * @param {url} static url
 * @return {Promise} process - loading is wrapped in a promise for consistence matters
 */
export const loadResourceData = ( url, params ) => {
  return new Promise( ( resolve ) => {
    get( url, params )
    .then( ( res ) => {
      resolve( res.data );
    } );
  } );
};

/**
 * Retrieves the metadata associated with a given webpage resource from its source code
 * @param {string} url - the url to start from to know where to retrieve the metadata
 * @return {Promise} process - loading is wrapped in a promise for consistence matters
 */
export const retrieveWebpageMetadata = ( url ) => {
  return new Promise( ( resolve ) => {
    if ( url.length ) {
      get( url )
        .then( ( { data: html } ) => {
          try {
            let title = /\<title\>(.+)\<\/title\>/.exec( html );
            title = title && title[1];
            let description = /\<meta\s+content="([^"]+)"\s+name="description"\s*\/\>/.exec( html )
              || /\<meta\s+name="description"\s+content="([^"]+)"\s*\/\>/.exec( html );
            description = description && description[1];
            let authors = /\<meta\s+content="([^"]+)"\s+name="author"\s*\/\>/.exec( html )
              || /\<meta\s+name="author"\s+content="([^"]+)"\s*\/\>/.exec( html );
            authors = authors && authors[1];
            authors = authors && [ authors ];
            resolve( {
              title,
              description,
              authors
            } );

          }
          catch ( e ) { /* eslint no-unused-vars : 0 */
            resolve( {} );
          }
        } )
        .catch( ( e ) => {
          resolve( {} );
        } );
    }
    else {
      resolve( {} );
    }
  } );
};

const youtubeRegexp = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/gi;
const vimeoRegexp = /^(https?\:\/\/)?(www\.)?(vimeo\.com)/gi;

/**
 * Retrieves the metadata associated with a given media resource from its source (youtube or vimeo only for now)
 * @param {string} url - the url to start from to know where to retrieve the metadata
 * @param {object} credentials - potential api keys to be used by the function
 * @return {Promise} process - loading is wrapped in a promise for consistence matters
 */
export const retrieveMediaMetadata = ( url ) => {
  return new Promise( ( resolve, reject ) => {

    // case youtube
    if ( url.match( youtubeRegexp ) ) {
      // must provide a youtube simple api key
      let videoId = url.match( /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/ );
      if ( videoId !== null ) {
          videoId = videoId[1];
          // for a simple metadata retrieval we can use this route that includes the api key
          const endPoint = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
          get( endPoint )
          .then( ( res ) => {
            const info = res.data;
            return resolve( {
                url,
                metadata: {
                  source: `Youtube: ${url}`,
                  title: info.title,
                  videoUrl: url,
                  authors: [ info.author_name ]
                }
              } );
          } )
          .catch( ( e ) => reject( e ) );
      }
      else {
        return resolve( { url, metadata: {
          videoUrl: url
        } } );
      }
  }
  // case vimeo: go through the oembed endpoint of vimeo api
  else if ( url.match( vimeoRegexp ) ) {
    const endpoint = `https://vimeo.com/api/oembed.json?url=${ url}`;
    get( endpoint )
    .then( ( res ) => {
      const data = res.data;
      resolve( {
        url,
        metadata: {
          source: `${data.author_name } (vimeo: ${url})`,
          title: data.title,
          description: data.description,
          videoUrl: url,
          authors: [ data.author_name ]
        }
      } );
    } )
    .catch( ( e ) => reject( e ) );
  }
 else {
    resolve( { url, metadata: {
      videoUrl: url
    } } );
  }
} );
};

/**
 * Converts bibtex data to csl-json in a secure way
 * (if not splitting all the refs in separate objects,
 * a single error blows the whole conversion process with citation-js.
 * This is a problem as for instance zotero bibTeX output
 * generates a lot of errors as it is not standard bibTeX).
 * @todo: comply to zotero-flavoured & mendeley-flavoured bibtex formatting
 * (see https://github.com/citation-style-language/schema/wiki/Data-Model-and-Mappings)
 * @param {string} str - input bibTeX-formatted string
 * @return {array} references - a list of csl-json formatted references
 */
export const parseBibTeXToCSLJSON = ( str = '' ) => {
  // forcing references separation to parse a maximum of references, even with shitty formatting
  const refs = str.split( '\n\n' );
  return refs.reduce( ( result, ref ) => {
    return [
      ...result,
      ...new Cite( ref ).get( {
        type: 'json',
        style: 'csl'
      } )
    ];
  }, [] );
};

/**
 * Retrieves metadata from the data of a resource, when possible
 * @param {object} data - the data of the resource
 * @param {string} assetType - the type of asset that is parsed
 * @return {object} metadata - information to merge with preexisting metadata
 */
export const inferMetadata = ( data, assetType ) => {
  switch ( assetType ) {
    case 'video':
      if ( data.metadata ) {
        return { ...data.metadata };
      }
      return {};
    case 'data-presentation':
      return { ...data.json.metadata };
    case 'image':
    case 'table':
      let title = data && data.file && data.file.name && data.file.name.split( '.' );
      if ( title ) {
        title.pop();
        title = title.join( '.' );
      }
      return {
        title,
        fileName: data && data.file && data.file.name && data.file.name, // @todo use lodash/getIn
        ext: data && data.file && data.file.name && data.file.name.split( '.' ).reverse()[0],
        mimetype: data && data.file && data.file.type
      };
    default:
      return {};
  }
};

/**
 * Handle the process of creating a new asset in a story content.
 * This implies three operations :
 * - create a contextualizer (which defines a way of materializing the resource)
 * - create contextualization (unique combination of a contextualizer, a section and a resource)
 * - insert an entity linked to the contextualization in the proper draft-js content state (main or note of the section)
 * @param {string} contentId - the id of editor to target ('main' or note id)
 * @param {string} resourceId - id of the resource to summon
 */
export const summonAsset = ( contentId, resourceId, props ) => {
    const {
      editedStory: story,
      editorStates,
      actions,
      match: {
        params: {
          sectionId,
        },
      },
      userId,
    } = props;

    const {
      id: storyId
    } = story;

    const {
      createContextualizer,
      createContextualization,
      updateDraftEditorState,
      updateSection,
      setEditorFocus,
    } = actions;

    const activeSection = story.sections[sectionId];
    const resource = story.resources[resourceId];

    const editorStateId = contentId === 'main' ? sectionId : contentId;
    let editorState = editorStates[editorStateId];
    const inJs = editorState.getSelection().toJS();
    if ( inJs.isBackward ) {
      editorState = EditorState.forceSelection(
        editorState,
        editorState.getSelection().merge( {
          isBackward: false,
          anchorOffset: inJs.focusOffset,
          focusOffset: inJs.anchorOffset,
          anchorKey: inJs.focusKey,
          focusKey: inJs.anchorKey,
        } )
      );
    }

    /*
     * choose if inline or block
     * todo: for now we infer from the resource type whether contextualization
     * must be in block or inline mode.
     * but we could choose to let the user decide
     * (e.g. 1: a 'bib' reference in block mode
     * could be the full reference version of the reference)
     * (e.g. 2: a 'quinoa presentation' reference in inline mode
     * could be an academic-like short citation of this reference)
     */

    // @todo: choose that from resource model
    const insertionType = [ 'bib', 'glossary', 'webpage' ].includes( resource.metadata.type ) ? 'inline' : 'block';
    // const hasAlias = resource.metadata.type === 'glossary' || resource.metadata.type === 'webpage';

    // get selected text
    const selectedText = getTextSelection( editorState.getCurrentContent(), editorState.getSelection() );

    /*
     * 1. create contextualizer
     * question: why isn't the contextualizer
     * data directly embedded in the contextualization data ?
     * answer: that way we can envisage for the future to
     * give users a possibility to reuse the same contextualizer
     * for different resources (e.g. comparating datasets)
     * and we can handle multi-modality in a smarter way.
     */

    // todo : consume model to do that
    const contextualizerId = genId();
    const contextualizer = {
      id: contextualizerId,
      type: resource.metadata.type,
    };
    createContextualizer( { storyId, contextualizerId, contextualizer, userId } );

    // 2. create contextualization
    const contextualizationId = genId();
    const contextualization = {
      id: contextualizationId,
      resourceId,
      contextualizerId,
      sectionId
    };

    createContextualization( { storyId, contextualizationId, contextualization, userId } );

    // 3. update the proper editor state

    let newEditorState = editorState;

    let isMutable = false;
    let selectedDisplacement;
    if ( insertionType === 'inline' ) {
      selectedDisplacement = selectedText.length;
      // if selection is empty we add placeholder text
      if ( selectedText.length === 0 ) {
        let placeholderText;
        switch ( resource.metadata.type ) {
          case 'glossary':
            placeholderText = resource.data.name;
            isMutable = true;
            break;
          case 'webpage':
            placeholderText = resource.metadata.title;
            isMutable = true;
            break;
          case 'bib':
          default:
            placeholderText = ' ';
            break;
        }
        const newContentState = Modifier.replaceText(
          newEditorState.getCurrentContent(),
          editorState.getSelection(),
          placeholderText
        );
        newEditorState = EditorState.push( newEditorState, newContentState, 'replace-text' );
        selectedDisplacement = placeholderText.length;
        newEditorState = EditorState.forceSelection(
          newEditorState,
          newEditorState.getSelection().merge( {
            anchorOffset: newEditorState.getSelection().getStartOffset() - selectedDisplacement
          } )
        );
      }
    }

    // update related editor state
    newEditorState = insertionType === 'block' ?
      insertBlockContextualization( newEditorState, contextualization, contextualizer, resource ) :
      insertInlineContextualization( newEditorState, contextualization, contextualizer, resource, isMutable );

    // update selection to put cursor after newly created item
    const newContentState = newEditorState.getCurrentContent();
    const lastEntityKey = newContentState.getLastCreatedEntityKey();
    const entity = newContentState.getEntity( lastEntityKey );
    let newSelection = editorState.getSelection();
    const activeSelection = newEditorState.getSelection();
    if ( insertionType === 'block' ) {
      const offsetKey = activeSelection.getFocusKey();
      const blockAfter = newContentState.getBlockAfter( offsetKey );
      if ( blockAfter ) {
        newSelection = SelectionState.createEmpty( blockAfter.getKey() );
      }
    }
    newEditorState = EditorState.forceSelection( newEditorState, newSelection );

    // update immutable editor state

    updateDraftEditorState( editorStateId, newEditorState );

    // update serialized editor state
    let newSection;
    if ( contentId === 'main' ) {
      newSection = {
        ...activeSection,
        contents: convertToRaw( newEditorState.getCurrentContent() )
      };
    }
    else {
      newSection = {
        ...activeSection,
        notes: {
          ...activeSection.notes,
          [contentId]: {
            ...activeSection.notes[contentId],
            contents: convertToRaw( newEditorState.getCurrentContent() )
          }
        }
      };
    }
    updateSection( { storyId, sectionId, section: newSection, userId } );

    setEditorFocus( undefined );
    setTimeout( () => setEditorFocus( contentId ) );
  };

export const deleteContextualizationFromId = ( {
  contextualization,
  editorStates,
  updateDraftEditorState,
  updateSection,
  section,
} ) => {
    const { id } = contextualization;
    let entityKey;
    let entity;
    let eData;
    let newEditorState;
    let contentId;

    /*
     * we dont know in advance for sure which editor is target by the contextualization
     * so we iterate through main editor state + notes editor states
     * (we could guess it but this is more safe)
     */
    Object.keys( editorStates )
      .find( ( key ) => {
        const editorState = editorStates[key];
        let found;
        const contentState = editorState.getCurrentContent();

        /*
         * we need to iterate through all blocks
         * find = stop when found (even if we do not care about the returned value)
         */
        contentState.getBlockMap().find( ( thatBlock ) => {
          // iterate through each character
          return thatBlock.getCharacterList().find( ( char ) => {
            // if there is an entity
            if ( char.entity ) {
              entityKey = char.entity;
              entity = contentState.getEntity( entityKey );
              eData = entity.toJS();
              // and if the entity is the right one
              if ( eData.data && eData.data.asset && eData.data.asset.id === id ) {
                found = true;
                // then find total entity range
                thatBlock.findEntityRanges(
                  ( metadata ) => {
                    return metadata.getEntity() === entityKey;
                  },
                  // ounce found
                  ( start, end ) => {
                    // delimitate its selection
                    const selectionState = editorState.getSelection().merge( {
                      anchorKey: thatBlock.getKey(),
                      focusKey: thatBlock.getKey(),
                      anchorOffset: start,
                      focusOffset: end,
                    } );
                    // and remove entity from this range
                    newEditorState = EditorState.push(
                      editorState,
                      Modifier.applyEntity(
                        contentState,
                        selectionState,
                        null
                      ),
                      'remove-entity'
                    );
                    // then update
                    contentId = key;
                    if ( newEditorState && contentId ) {
                      // apply change
                      const newSection = contentId === section.id ?
                      {
                        ...section,
                        contents: convertToRaw( newEditorState.getCurrentContent() )
                      } : {
                        ...section,
                        notes: {
                          ...section.notes,
                          [contentId]: {
                            ...section.notes[contentId],
                            contents: convertToRaw( newEditorState.getCurrentContent() )
                          }
                        }
                      };
                      // update section
                      updateSection( { ...newSection } );
                      if ( typeof updateDraftEditorState === 'function' ) {
                        // update real time editor state
                         updateDraftEditorState( contentId, newEditorState );
                      }
                    }
                  }
                );

                return true;
              }
            }

          } );
        } );
        return found;
      } );
  };

  export const removeContextualizationReferenceFromRawContents = ( contents, contId ) => {
      let changed;
      const newContents = Object.keys( contents.entityMap ).reduce( ( result, entityKey ) => {
        const entity = contents.entityMap[entityKey];
        // console.log('parsing', entityKey, 'contents are', result.entityMap);
        if ( ( entity.type === BLOCK_ASSET || entity.type === INLINE_ASSET ) && entity.data && entity.data.asset && entity.data.asset.id === contId ) {
          // console.log('found', entityKey);
          changed = true;
          return {
            blocks: result.blocks.map( ( block ) => {
              if ( block.type === 'atomic' && block.entityRanges.find( ( range ) => range.key === entityKey ) ) {
                return undefined;
              }
              return {
                ...block,
                entityRanges: block.entityRanges.filter( ( range ) => range.key !== entityKey )
              };
            } ).filter( ( b ) => b ),
            entityMap: Object.keys( result.entityMap ).reduce( ( newMap, thatEntityKey ) => {
              // console.log('comparing', thatEntityKey, entityKey, thatEntityKey === entityKey);
              if ( thatEntityKey === entityKey ) {
                // console.log('excluding', entityKey)
                return newMap;
              }
              return {
                ...newMap,
                [thatEntityKey]: result.entityMap[thatEntityKey]
              };
            }, {} )
          };
        }
        return result;
      }, { ...contents } );

      // console.log('final result', newContents.entityMap);
      return { result: newContents, changed };
    };

export const cleanUncitedNotes = ( section ) => {
  const { notesOrder, notes } = section;
  const newNotes = { ...notes };
  Object.keys( newNotes ).forEach( ( noteId ) => {
    if ( !notesOrder.includes( noteId ) ) {
      delete newNotes[noteId];
    }
  } );
  return newNotes;
};
export const deleteUncitedContext = ( sectionId, props ) => {
  const {
    editedStory,
    userId,
    actions: {
      deleteContextualizer,
      deleteContextualization,
      updateSection
    }
  } = props;

  const { id: storyId } = editedStory;
  const cleanedSection = {
    ...editedStory.sections[sectionId],
    notes: cleanUncitedNotes( editedStory.sections[sectionId] )
  };
  updateSection( { storyId, sectionId, section: cleanedSection, userId } );

  const citedContextualizationIds = Object.keys( cleanedSection.notes ).reduce( ( contents, noteId ) => [
    ...contents,
    editedStory.sections[sectionId].notes[noteId].contents,
  ], [ editedStory.sections[sectionId].contents ] )
  .reduce( ( entities, contents ) =>
    [
      ...entities,
      ...Object.keys( contents && contents.entityMap || {} ).reduce( ( localEntities, entityId ) => {
        const entity = contents.entityMap[entityId];
        const isContextualization = entity.type === 'INLINE_ASSET' || entity.type === 'BLOCK_ASSET';
        if ( isContextualization ) {
          return [ ...localEntities, entity.data.asset.id ];
        }
        return localEntities;
      }, [] )
    ],
  [] );
  const uncitedContextualizations = Object.keys( editedStory.contextualizations )
                                        .map( ( id ) => editedStory.contextualizations[id] )
                                        .filter( ( contextualization ) => {
                                          return contextualization.sectionId === sectionId && !citedContextualizationIds.includes( contextualization.id );
                                        } );
  uncitedContextualizations.forEach( ( contextualization ) => {
    const { contextualizerId, id: contextualizationId } = contextualization;
    deleteContextualization( { storyId, contextualizationId, userId } );
    deleteContextualizer( { storyId, contextualizerId, userId } );
  } );
};
