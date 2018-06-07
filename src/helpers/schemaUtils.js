import Ajv from 'ajv';
import def from 'json-schema-defaults';

import storySchema from 'quinoa-schemas/story';

const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));


const sectionSchema = {
  ...storySchema.properties.sections.patternProperties['[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'],
  ...storySchema.definitions,
};

export const validate = (schema, data) => {
  const val = ajv.compile(schema);
  return {valid: val(data), errors: val.errors};
};

export const validateStory = story => validate(storySchema, story);

export const defaults = schema => def(schema);

export const createDefaultStory = () => defaults(storySchema);

export const createDefaultSection = () => defaults(sectionSchema);
