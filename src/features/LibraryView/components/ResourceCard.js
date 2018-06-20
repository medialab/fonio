import React from 'react';
import PropTypes from 'prop-types';

import resourceSchema from 'quinoa-schemas/resource';

import {Bibliography} from 'react-citeproc';
import english from 'raw-loader!../../../sharedAssets/bibAssets/english-locale.xml';
import apa from 'raw-loader!../../../sharedAssets/bibAssets/apa.csl';

import {
  Column,
  Columns,

  Icon,

  StatusMarker,
  Card,
} from 'quinoa-design-library/components';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const ResourceCard = ({
  resource,
  lockData,
  onEdit,
  onDelete
}, {t}) => {

  const {
    data,
    metadata = {}
  } = resource;

  const {
    type,
    title,
    description,
    source,
  } = metadata;

  const translate = translateNameSpacer(t, 'Features.LibraryView');

  const specificSchema = resourceSchema.definitions[type];

  const shorten = (str, limit) => {
    if (str.length < limit) {
      return str;
    }
    return `${str.substr(0, limit - 3)}...`;
  };

  let resourceTitle;
  if (specificSchema.showMetadata && title) {
    resourceTitle = title;
  }
 else if (type === 'glossary' && data && data.name) {
    resourceTitle = data.name;
  }
 else if (type === 'bib' && data && data[0]) {
    const bibData = {
      [data[0].id]: data[0]
    };
    resourceTitle = <Bibliography items={bibData} style={apa} locale={english} />;
  }
 else resourceTitle = translate('untitled resource');

  return (
    <Card
      bodyContent={
        <div>
          <Columns>
            <Column isSize={2}>
              <Icon isSize="medium" isAlign="left">
                <img src={icons[type].black.svg} />
              </Icon>
            </Column>

            <Column isSize={8}>
              {resourceTitle}
            </Column>

            <Column isSize={2}>
              <StatusMarker
                lockStatus={lockData ? 'locked' : 'open'}
                statusMessage={lockData ? translate('edited by {a}', {a: lockData.name}) : translate('open to edition')} />
            </Column>
          </Columns>
          <Column>
            {
              specificSchema.showMetadata &&
              <div>
                {
                  source &&
                  <p>
                    {translate('Source: ')} : {shorten(source, 30)}
                  </p>
                }
                {
                  description &&
                  <p>
                    <i>{shorten(description, 40)}</i>
                  </p>
                }
              </div>
            }
            {
              type === 'glossary' &&
              data && data.description &&
              <div>
                <p>
                  <i>{shorten(data.description, 40)}</i>
                </p>
              </div>
            }
          </Column>
        </div>
        }
      footerActions={[
          {
            id: 'edit',
            isColor: 'info',
            label: 'edit',
            isDisabled: lockData,
          },
          {
            id: 'delete',
            isColor: 'danger',
            label: 'delete',
            isDisabled: lockData
          }
        ]}
      onAction={action => {
        if (action === 'edit') {
          onEdit();
        }
        else if (action === 'delete') {
          onDelete();
        }
      }} />
  );

};


ResourceCard.contextTypes = {
  t: PropTypes.func.isRequired
};


export default ResourceCard;
