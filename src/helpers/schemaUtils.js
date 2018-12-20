/**
 * This module provides schema-related utils
 * @module fonio/utils/schemaUtils
 */
import Ajv from 'ajv';
import def from 'json-schema-defaults';
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
