import React from 'react';
import PropTypes from 'prop-types';
import cslDataModel from './assets/csl-data.json';

import {v4 as generateId} from 'uuid';

import OptionSelect from '../OptionSelect/OptionSelect';

import {translateNameSpacer} from '../../helpers/translateUtils';


const modelProperties = cslDataModel.items.properties;

const forbiddenProperties = ['id'];

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

const PropertyInput = ({
  model,
  modelKey,
  reference,
  onChange
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.BibEditorGui');
  if (model.enum) {
    // activeOptionId,
    //   options = [],
    //   title,
    //   searchable = false,
    //   onChange
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
    case 'array':
      const itemsModel = model.items;
      const onAddItem = () => {
        let defaultObject;
        if (modelKey === 'author') {
          defaultObject = {
            family: '',
            given: '',
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
      const onDeleteItem = (id) => {
        const newItems = reference[modelKey].filter(item => item.id !== id);
        onChange(newItems);
      };
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
    default:
      if (model.$ref) {
        subModel = findModelFromRef(modelProperties, model.$ref);
        return (
          <div
            className="properties-group">
            {
              Object.keys(subModel)
              // not going into second-level arrays because it becomes too complicated
              // for everyone + useless
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

PropertyInput.contextTypes = {
  t: PropTypes.func.isRequired,
};

const ReferenceEditor = ({
  reference,
  model,
  onChange,
  onDelete,
  title
}, context) => {
  const activeModel = model || modelProperties;
  const translate = translateNameSpacer(context.t, 'Components.BibEditorGui');
  const addableProperties = Object.keys(activeModel)
        .filter(key => reference[key] === undefined)
        .map(key => ({
          label: key,
          value: key
        }));
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

ReferenceEditor.contextTypes = {
  t: PropTypes.func.isRequired,
};

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

BibEditorGui.contextTypes = {
  t: PropTypes.func.isRequired,
};

export default BibEditorGui;
