import React from 'react';
import PropTypes from 'prop-types';

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

  const translate = translateNameSpacer(t, 'Features.LibraryView');

  return (
    <Card
      bodyContent={
        <div>
          <Columns>
            <Column isSize={2}>
              <Icon isSize="medium" isAlign="left">
                <img src={icons[resource.metadata.type].black.svg} />
              </Icon>
            </Column>

            <Column isSize={8}>
              {resource.metadata.title}
            </Column>

            <Column isSize={2}>
              <StatusMarker
                lockStatus={lockData ? 'locked' : 'open'}
                statusMessage={lockData ? translate('edited by {a}', {a: lockData.name}) : translate('open to edition')} />
            </Column>
          </Columns>
          <Column>
            {
              ['image', 'video'].indexOf(resource.metadata.type) > -1 &&
              <img src="https://inra-dam-front-resources-cdn.brainsonic.com/ressources/afile/224020-77d3e-picture_client_link_1-ouverture-dossier-controverse.JPG" />
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
