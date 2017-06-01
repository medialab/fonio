import {v4 as genId} from 'uuid';

import storyModel from '../models/storyModel.json';
import sectionModel from '../models/sectionModel.json';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let validateEntity = {};

const validateObject = (model, obj) => {
  if (typeof obj !== 'object') {
    return false;
  }
  if (model.keys) {
    const keys = Object.keys(model.keys);
    // case non-controlled keys (i.e. uuids)
    if (keys.indexOf('$each') > -1) {
      const keyType = model.keys.$each.keyType;
      if (keyType === 'uuid') {
        const invalidKey = Object.keys(obj).find(key => uuidRegex.test(key) === false);
        // some keys are not uuid
        if (invalidKey !== undefined) {
          return false;
        }
      }
      const invalidKey = Object.keys(obj).find(objKey => {
        return !validateEntity(model.keys.$each, obj[objKey]);
      });
      return invalidKey === undefined;
    }
    else {
      // looking for any invalid key in the object
      const invalidKey = keys.find(modelKey => {
        const isRequired = model.keys[modelKey].required;
        // the object has the prop or the prop is not required
        if (obj[modelKey] || !isRequired) {
          return !validateEntity(model.keys[modelKey], obj[modelKey]);
        // the object does not have the prop and it is required
        }
        else {
          return true;
        }
      });
      return invalidKey === undefined;
    }
  }
  return true;
};

const validateArray = (model, array) => {
  if (!Array.isArray(array)) {
    return false;
  }
  if (model.children) {
    const invalidChild = array.find(child => {
      return validateEntity(model.children, child) === false;
    });
    return invalidChild === undefined;
  }
  return true;
};

const validateString = (model, entity, regex) => {
  if (typeof entity !== 'string') {
    return false;
  }
  if (model.possibleValues) {
    return model.possibleValues.indexOf(entity) > -1;
  }
  if (regex) {
    return regex.test(entity);
  }
  return true;
};

validateEntity = (model, entity) => {
  if (entity === undefined && !model.required) {
    return true;
  }
  let dataType = model.type;
  if (Array.isArray(dataType)) {
    // guess datatype
    if (typeof entity === 'string') {
      dataType = uuidRegex.test(entity) ? 'uuid' : 'string';
    }
 else if (typeof entity === 'number') {
      dataType = 'number';
    }
 else if (typeof entity === 'object') {
      if (Array.isArray(entity)) {
        dataType = 'array';
      }
 else {
        dataType = 'object';
      }
    }
  }
  switch (dataType) {
    case 'object':
      return validateObject(model, entity);
    case 'string':
      return validateString(model, entity);
    case 'uuid':
      return validateString(model, entity, uuidRegex);
    case 'array':
      return validateArray(model, entity);
    default:
      return true;
  }
};

const createDefaultPortion = model => {
  return Object.keys(model).reduce((result, key) => {
    const prop = model[key];
    if (key !== '$each') {
      switch (prop.type) {
        case 'string':
          result[key] = prop.default || '';
          return result;
        case 'number':
          result[key] = prop.default || 0;
          return result;
        case 'uuid':
          result[key] = genId();
          break;
        case 'object':
          if (model.keyType !== 'uuid' && prop.keys) {
            result[key] = createDefaultPortion(prop.keys);
          }
          else {
            result[key] = {};
          }
          break;
        case 'array':
          result[key] = [];
          break;
        default:
          return result;
      }
    }
    return result;
  }, {});
};

export const createDefaultStory = () => {
  return createDefaultPortion(storyModel.keys);
};

export const createDefaultSection = () => {
  return createDefaultPortion(sectionModel.keys);
};

/**
 * Validates the given story
 * @param {object} data - the data to validate
 $ @return {boolean} isValid - the result of the validation
 */
export default function validateStoryData (data) {
  return validateEntity(storyModel, data);
}
