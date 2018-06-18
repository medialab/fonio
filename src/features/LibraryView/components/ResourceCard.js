import React from 'react';
import PropTypes from 'prop-types';

import resourceSchema from 'quinoa-schemas/resource';

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
              {title}
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
          </Column>
        </div>
        }
      footerActions={[
          {
            id: 'edit',
            isColor: 'info',
            label: 'edit'
          },
          {
            id: 'delete',
            isColor: 'danger',
            label: 'delete'
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
