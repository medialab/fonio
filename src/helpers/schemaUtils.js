/**
 * This module provides schema-related utils
 * @module fonio/utils/schemaUtils
 */
import Ajv from 'ajv';
import def from 'json-schema-defaults';
import { v4 as genId } from 'uuid';
import { mapValues, omit, get, tail, split, set } from 'lodash/fp';

import storySchema from 'quinoa-schemas/story';
import resourceSchema from 'quinoa-schemas/resource';
import { findTempateByVersion, getTemplateName } from 'quinoa-schemas';
import { templates } from 'quinoa-story-player';

const ajv = new Ajv();
ajv.addMetaSchema( require( 'ajv/lib/refs/json-schema-draft-06.json' ) );

const sectionSchema = {
  ...storySchema.properties.sections.patternProperties['[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'],
  ...storySchema.definitions,
};

export const validate = ( schema, data ) => {
  const val = ajv.compile( schema );
  return { valid: val( data ), errors: val.errors };
};

export const validateStory = ( story ) => validate( storySchema, story );

export const validateResource = ( resource ) => {
  let validation = validate( resourceSchema, resource );
  if ( validation.valid ) {
    const dataSchema = resourceSchema.definitions[resource.metadata.type];
    validation = validate( dataSchema, resource.data );
  }
  return validation;
};

export const defaults = ( schema ) => def( schema );

/**
 * Storys will now be created following the 1.1 schema specifications.
 */
export const createDefaultStory = () => {
  const story = defaults( storySchema );
  return set(
    [
      'settings',
      'styles',
      getTemplateName( story ),
      'stylesVariables',
    ],
    defaults(
      findTempateByVersion( story, templates ).stylesVariables
    ),
    story
  );
};

export const createDefaultSection = () => defaults( sectionSchema );

export const createDefaultResource = () => defaults( resourceSchema );

export const deref = ( schema ) => {
  const replaceRef = ( property ) => {
    if ( !!property.$ref ) {
      return omit( [ '$ref' ], {
        ...property,
        ...get(
          tail( split( /\//g, property.$ref ) ),
          schema
        )
      } );
    }
    return property;
  };

  return mapValues(
    ( property ) => {
      const derefered = replaceRef( property );
      if ( derefered.properties ) {
        return {
          ...derefered,
          properties: mapValues( replaceRef, derefered.properties )
        };
      }
      return derefered;
    }
  , schema.properties );
};

export const peritextToQuinoa = ( production ) => {
  const additionalResourcesIds = [];
  const normalizeMetadata = ( metadata ) => ( {
    ...metadata,
    authors: ( metadata.authors || [] ).map( ( { family, given } ) => `${given} ${family}` )
  } );
  // build sections
  const sections = Object.entries( production.resources ).reduce( ( res, [ id, resource ] ) => {
    if ( resource.metadata.type === 'section' || !resource.metadata.type ) {
      const inOrder = production.sectionsOrder.find( ( { resourceId } ) => resourceId === id );
      let level = 0;
      if ( inOrder ) {
        level = inOrder.level;
      }
      return {
        ...res,
        [id]: {
          ...resource,
          metadata: {
            ...normalizeMetadata( resource.metadata ),
            level
          },
          data: undefined,
          ...resource.data.contents
        }
      };
    // if a resource has contents we add it as a section
    }
    else if ( resource.data && resource.data.contents && resource.data.contents.contents && resource.data.contents.contents.blocks && resource.data.contents.contents.blocks.length ) {
      const newId = genId();
      additionalResourcesIds.push( newId );
      return {
        ...res,
        [id]: {
          ...resource,
          metadata: {
            ...normalizeMetadata( resource.metadata ),
            level: 0
          },
          data: undefined,
          ...resource.data.contents
        }

      };
    }
 else return res;
  }, {} );
  // align resources
  const resources = Object.entries( production.resources ).reduce( ( res, [ id, resource ] ) => {
    switch ( resource.metadata.type ) {
      // not taking resources
      case 'section':
        return res;
      case 'table':
        const data = production.assets[resource.data.dataAssetId];
        return {
          ...res,
          [id]: {
            ...resource,
            metadata: normalizeMetadata( resource.metadata ),
            data
          }
        };
      case 'images':
      case 'image':
        let base64 = production.assets[resource.data.images[0].rgbImageAssetId];
        base64 = base64 && base64.data;
        return {
          ...res,
          [id]: {
            ...resource,
            metadata: {
              ...normalizeMetadata( resource.metadata ),
              type: 'image'
            },
            data: {
              base64
            }
          }
        };
      case 'video':
        return {
          ...res,
          [id]: {
            ...resource,
            metadata: normalizeMetadata( resource.metadata ),
            data: {
              url: resource.data.mediaUrl
            }
          }
        };
      case 'bib':
        return {
          ...res,
          [id]: {
            ...resource,
            data: resource.citations
          }
        };
      case 'embed':
      case 'webpage':
      case 'glossary':
      default:
        return {
          ...res,
          [id]: {
            ...resource,
            data: {
              ...resource.data,
              contents: undefined
            }
          }
        };
    }
  }, {} );
  // convert contextualizations
  const contextualizations = Object.entries( production.contextualizations ).reduce( ( res, [ id, contextualization ] ) => ( {
    ...res,
    [id]: {
      ...contextualization,
      resourceId: contextualization.sourceId,
      sectionId: contextualization.targetId
    }
  } ), {} );
  // convert contextualizers
  const contextualizers = Object.entries( production.contextualizers ).reduce( ( res, [ id, contextualizer ] ) => ( {
    ...res,
    [id]: {
      ...contextualizer,
      insertionType: contextualizer.insertionType === 'INLINE_ASSET' ? 'inline' : 'block'
    }
  } ), {} );
  const story = {
    ...createDefaultStory(),
    ...production,
    sectionsOrder: [
      ...production.sectionsOrder.map( ( { resourceId } ) => resourceId ),
      ...additionalResourcesIds
    ],
    resources,
    sections,
    contextualizations,
    contextualizers,
    type: 'quinoa-story',
    metadata: {
      ...normalizeMetadata( production.metadata ),
      publicationConsent: false,
      version: '1.1'
    },
    editions: undefined
  };
  return story;
};
