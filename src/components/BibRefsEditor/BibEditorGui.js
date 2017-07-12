import React from 'react';
import PropTypes from 'prop-types';
import cslDataModel from './assets/csl-data.json';

import OptionSelect from '../OptionSelect/OptionSelect';

import {translateNameSpacer} from '../../helpers/translateUtils';


const modelProperties = cslDataModel.items.properties;

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
    case 'string-number':
    case undefined:
      return (
        <input
          value={reference[modelKey]}
          type="text"
          placeholder={modelKey}
          onChange={onInputChange} />
      );
    case 'array':
      const itemsModel = model.items;
      const onAddItem = () => {
        onChange([
          ...reference[modelKey],
          {}
        ]);
      };
      const subModel = itemsModel.type[0].properties;
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
                return (<div className="subcategory-container" key={modelKey}>
                  <h5>{modelKey}</h5>
                  <ReferenceEditor
                    reference={item}
                    model={subModel}
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
      // console.log('unhandled model type', modelType);
      return (<span>Unhandled</span>);
  }
};

PropertyInput.contextTypes = {
  t: PropTypes.func.isRequired,
};

const ReferenceEditor = ({
  reference,
  model,
  onChange
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
  return (
    <div className="reference-editor">
      <h4>{translate('edit-reference')}</h4>
      {
        Object.keys(activeModel)
        .filter(key => reference[key] !== undefined)
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
          return <ReferenceEditor reference={reference} key={index} onChange={onReferenceChange} />;
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
