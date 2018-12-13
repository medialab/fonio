/**
 * This module provides schema-related utils
 * @module fonio/utils/schemaUtils
 */
import Ajv from 'ajv';
import def from 'json-schema-defaults';

import storySchema from 'quinoa-schemas/story';
import resourceSchema from 'quinoa-schemas/resource';
import { findTempateByVersion } from './schemaVersionsUtils';

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

export const createDefaultStory = () => {
  const story = defaults( storySchema );
  const template = findTempateByVersion( story );
  return {
    ...story,
    settings: {
      ...story.settings,
      styles: {
        [story.settings.templateId]: {
          ...( story.settings.styles[story.settings.templateId] || {} ),
          stylesVariables: defaults( template.stylesVariables )
        }
      }
    }
  };
};

export const createDefaultSection = () => defaults( sectionSchema );

export const createDefaultResource = () => defaults( resourceSchema );

import { map, dissoc, split, tail, path, when, mergeRight, set, lensProp } from 'ramda';

export const deref = ( schema ) => {

  const f = when(
    ( p ) => !!p.$ref,
    ( property ) => dissoc(
      '$ref',
      mergeRight(
        property,
        path( tail( split( /\//g, property.$ref ) ), schema )
      )
    )
  );

  return map(
    ( property ) => {
      const res = f( property );
      if ( res.properties ) {
        return set(
          lensProp( 'properties' ),
          map( f )( res.properties ),
          res
        );
      }
      return res;
    }
  , schema.properties );
};
