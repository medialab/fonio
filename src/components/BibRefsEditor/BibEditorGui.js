/**
 * This module provides a gui component to edit bibliographical references
 * based on the csl data schema (see https://github.com/citation-style-language/schema)
 * @todo: very experimental, not fully tested, and UI is quite bad
 * The matter here is to rely as much as possible on csl data to generate automatically the proper input
 * A problem remains also with the translations of the csl keys which are very obscure for some of them
 * @module fonio/components/BibRefsEditor
 */

import React from 'react';
import PropTypes from 'prop-types';
import cslDataModel from './assets/csl-data.json';

import {v4 as generateId} from 'uuid';

import OptionSelect from '../OptionSelect/OptionSelect';

import {translateNameSpacer} from '../../helpers/translateUtils';


const modelProperties = cslDataModel.items.properties;

const forbiddenProperties = ['id'];


/**
 * Finds the proper model from a schema ref.
 * In order to avoid repetition some models in the csl schema
 * contain a unique key '$ref' that point to another part of the schema.
 * This function finds the related reference in the schema and returns it
 * @param {object} model - the model to search into
 * @param {string} ref - the ref to search
 * @return {object} outputModel - the referenced model data
 */
const findModelFromRef = (model, ref) => {
  let outputModel;
  Object.keys(model).some(id => {
    const subModel = model[id];
    if (subModel.id === ref) {
      const type = subModel.type;
      outputModel = Array.isArray(type) ? type[0].properties : type.properties;
      return true;
    }
    else if (subModel.items && subModel.items.id === ref) {
      const type = subModel.items.type;
      outputModel = Array.isArray(type) ? type[0].properties : type.properties;
      return true;
    }
  });
  return outputModel;
};


/**
 * Renders the PropertyInput component as a pure function
 * It provides the proper unser input component for a given bibliographic data model
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const PropertyInput = ({
  model,
  modelKey,
  reference,
  onChange,
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.BibEditorGui');
  if (model.enum) {
    const options = model.enum.map(value => ({
      value,
      label: value,
    }));
    const onSelectChange = value => {
      onChange(value);
    };
    return (<OptionSelect
      title={translate('select-type')}
      options={options}
      searchable
      activeOptionId={reference[modelKey]}
      onChange={onSelectChange} />);
  }
  const onInputChange = e => {
    const value = e.target.value;
    onChange(value);
  };
  const modelType = Array.isArray(model.type) && typeof model.type[0] !== 'object' ? model.type.join('-') : model.type;
  switch (modelType) {
    // for most of the case we use a text input
    case 'string':
    case 'number':
    case 'string-number-boolean':
    case 'string-number':
    case 'name-variable':
      return (
        <input
          value={reference[modelKey] || ''}
          type="text"
          placeholder={modelKey}
          onChange={onInputChange} />
      );
    // array models require to recursively
    // call a ReferenceEditor component to handle the submodel
    case 'array':
      const itemsModel = model.items;
      // callbacks when an item is added
      const onAddItem = () => {
        let defaultObject;
        // todo: this is a bit dirty
        if (modelKey === 'author') {
          defaultObject = {
            family: ' ',
            given: ' ',
            id: generateId()
          };
        }
        else {
          defaultObject = {
            id: generateId()
          };
        }
        onChange([
          ...reference[modelKey],
          defaultObject
        ]);
      };
      // callbacks when a sub item is deleted
      const onDeleteItem = (id) => {
        const newItems = reference[modelKey].filter(item => item.id !== id);
        onChange(newItems);
      };
      // determining the sub model
      let subModel;
      if (itemsModel.type) {
        subModel = itemsModel.type[0].properties;
      }
      else {
        subModel = findModelFromRef(modelProperties, itemsModel.$ref); // {type: itemsModel.$ref};
      }
      return (
        <div className="sub-properties-group">
          {
            reference[modelKey] &&
            reference[modelKey]
              .map((item, itemIndex) => {
                const onSubItemChange = (key, value) => {
                  const newValues = [
                    ...reference[modelKey]
                  ];
                  newValues[itemIndex][key] = value;
                  onChange(newValues);
                };
                let title;
                if (modelKey === 'author') {
                  title = translate('edit-author');
                }
                // returning a wrapped reference editor
                return (
                  <div
                    className="subcategory-container"
                    key={itemIndex}>
                    <ReferenceEditor
                      reference={item}
                      onDelete={onDeleteItem}
                      model={subModel}
                      title={title}
                      onChange={onSubItemChange} />
                  </div>);
              })
          }
          <button className="add-item" onClick={onAddItem}>
            {translate('add-item')}
          </button>
        </div>
      );
    // unhandled case
    default:
      // some parts of the schema are entirely handled by a $ref
      // (see above)
      if (model.$ref) {
        subModel = findModelFromRef(modelProperties, model.$ref);
        // in this case the submodel is itself an object
        // (e.g. "issued" key)
        // we have to handle its display specifically
        return (
          <div
            className="properties-group">
            {
              Object.keys(subModel)
              // not going into second-level arrays because it becomes too complicated
              // for everyone + useless
              // so we filter these nasty sub-sub-properties
              .filter(subModelKey => subModel[subModelKey].type !== 'array')
              .map((subModelKey, index) => {
                const nanoModel = subModel[subModelKey];
                const onSubChange = (value) => {
                  let newValues;
                  if (typeof reference[modelKey] === 'object') {
                    newValues = {...reference[modelKey]};
                    newValues[subModelKey] = value;
                  }
                  else {
                    newValues = {
                      [subModelKey]: value
                    };
                  }
                  onChange(newValues);
                };
                return (
                  <div className="property-group" key={index}>
                    <i className="property-label">{subModelKey}</i>
                    <PropertyInput
                      model={nanoModel}
                      modelKey={subModelKey}
                      reference={reference[modelKey]}
                      onChange={onSubChange} />
                  </div>
                );
              })
            }
          </div>
        );
      }
      return (<span>Unhandled</span>);
  }
};

PropertyInput.propTypes = {

  /**
   * the model to use for defining the proper user input
   */
  model: PropTypes.object,

  /**
   * key of the model to use (used in html for some cases)
   */
  modelKey: PropTypes.string,

  /**
   * the reference to render in the input
   */
  reference: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),

  /**
   * callbacks when input is changed
   */
  onChange: PropTypes.func,
};


/**
 * Component's context used properties
 */
PropertyInput.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired,
};


/**
 * Renders the ReferenceEditor component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const ReferenceEditor = ({
  reference,
  model,
  title,
  onChange,
  onDelete,
}, context) => {
  const activeModel = model || modelProperties;
  const translate = translateNameSpacer(context.t, 'Components.BibEditorGui');
  const addableProperties = Object.keys(activeModel)
        .filter(key => reference[key] === undefined)
        .map(key => ({
          label: key,
          value: key
        }));
  // adds the proper base value for a property against its type
  const addEmptyProperty = key => {
    let defaultValue;
    const thatModel = activeModel[key];
    const modelType = Array.isArray(thatModel.type) ? thatModel.type.join('-') : thatModel.type;
    switch (modelType) {
      case 'string':
      case 'string-number':
        defaultValue = '';
        break;
      case 'number':
        break;
      case 'array':
        defaultValue = [];
        break;
      case undefined:
        defaultValue = '';
        break;
      default:
        // console.log('unhandled default property value', modelType);
        break;
    }
    onChange(key, defaultValue);
  };
  const onDeleteClick = e => {
    e.stopPropagation();
    if (typeof onDelete === 'function') {
      onDelete(reference.id);
    }
  };
  return (
    <div className="reference-editor">
      <h4 className="editor-title">
        <span className="title">{title}</span>
        <button onClick={onDeleteClick}>
          <img
            className="fonio-icon-image"
            src={require('../../sharedAssets/close-black.svg')} />
        </button></h4>
      {
        Object.keys(activeModel)
        .filter(key => reference[key] !== undefined && forbiddenProperties.indexOf(key) === -1)
        .sort()
        .map(key => {
          const thatModel = activeModel[key];
          const onPropertyChange = value => {
            onChange(key, value);
          };
          const removeProperty = () => {
            onChange(key, undefined);
          };
          return (
            <div className="property-group" key={key}>
              <i className="property-label">{key}</i>
              <div className="property-input">
                <PropertyInput
                  modelKey={key}
                  model={thatModel}
                  reference={reference}
                  onChange={onPropertyChange} />
                <button
                  className="remove-property"
                  onClick={removeProperty}>
                  <img
                    className="fonio-icon-image"
                    src={require('../../sharedAssets/close-black.svg')} />
                </button>
              </div>

            </div>
          );
        })
      }
      <div className="property-add-container">
        <OptionSelect
          title={translate('add-a-property')}
          options={addableProperties}
          searchable
          onChange={addEmptyProperty} />
      </div>
    </div>
  );
};


/**
 * Component's properties types
 */
ReferenceEditor.propTypes = {

  /**
   * Reference to render
   */
  reference: PropTypes.object,

  /**
   * Model to use for building proper inputs
   */
  model: PropTypes.object,

  /**
   * Title to display
   */
  title: PropTypes.string,

  /**
   * Callbacks when the reference is changed (args: key, value)
   */
  onChange: PropTypes.func,

  /**
   * Callbacks when the reference is delete
   */
  onDelete: PropTypes.func,
};


/**
 * Component's context used properties
 */
ReferenceEditor.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired,
};


/**
 * Renders the BibEditorGui component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const BibEditorGui = ({
  references = [],
  onChange,
  onReferenceDelete,
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.BibEditorGui');
  const addEmptyReference = () => {
    onChange();
  };
  return (
    <div className="fonio-BibEditorGui">
      {
        references.map((reference, index) => {
          const onReferenceChange = (key, value) => {
            onChange(reference.id, key, value);
          };
          return (<ReferenceEditor
            reference={reference}
            key={index}
            onChange={onReferenceChange}
            onDelete={onReferenceDelete}
            title={translate('edit-reference')} />);
        })
      }
      <button className="add-item" onClick={addEmptyReference}>
        {translate('add-reference')}
      </button>
    </div>
  );
};


/**
 * Component's properties types
 */
BibEditorGui.propTypes = {

  /**
   * references to render in the interfaces (csl-json formatted)
   */
  references: PropTypes.array,

  /**
   * Callbacks when one change (args: id, key, value to change)
   */
  onChange: PropTypes.func.isRequired,

  /**
   * callbacks when a reference is delete (arg: id of the reference to delete)
   */
  onReferenceDelete: PropTypes.func.isRequired,
};


/**
 * Component's context used properties
 */
BibEditorGui.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired,
};

export default BibEditorGui;
