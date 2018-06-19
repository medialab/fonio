import React from 'react';
import PropTypes from 'prop-types';

import ReactTooltip from 'react-tooltip';

import resourceSchema from 'quinoa-schemas/resource';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {Bibliography} from 'react-citeproc';
import english from 'raw-loader!../../../sharedAssets/bibAssets/english-locale.xml';
import apa from 'raw-loader!../../../sharedAssets/bibAssets/apa.csl';


import {
  Button,
  Card,
  Column,
  Columns,
  Icon,
  StatusMarker,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

const ResourceMiniCard = ({
  resource = {},
  lockData,
  isActive,
  onEdit,
  onDelete,
}, {t}) => {

  const {
    data,
    metadata = {}
  } = resource;

  const {
    type,
    title,
  } = metadata;

  const translate = translateNameSpacer(t, 'Features.SectionView');

  const specificSchema = resourceSchema.definitions[type];

  let lockStatus;
  let lockMessage;
  if (isActive) {
    lockStatus = 'active';
    lockMessage = translate('edited by you');
  }
  else if (lockData) {
    lockStatus = 'locked';
    lockMessage = translate('edited by {a}', {a: lockData.name});
  }
  else {
    lockStatus = 'open';
    lockMessage = translate('open to edition');
  }

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
                lockStatus={lockStatus}
                statusMessage={lockMessage} />
            </Column>
          </Columns>
          <Columns>
            <Column isOffset={2} isSize={10}>
              <Button data-for="card-action" data-tip={translate('drag this card to the editor')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.move.black.svg} />
                </Icon>
              </Button>
              <Button
                onClick={onEdit} isDisabled={isActive || lockStatus === 'locked'} data-for="card-action"
                data-tip={'settings'}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.settings.black.svg} />
                </Icon>
              </Button>
              <Button
                onClick={onDelete} isDisabled={isActive || lockStatus === 'locked'} data-for="card-action"
                data-tip={translate('delete this resource')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.remove.black.svg} />
                </Icon>
              </Button>
              {type === 'image' &&
                <Button data-for="card-action" data-tip={translate('use as cover image')}>
                  <Icon isSize="small" isAlign="left">
                    <img src={icons.cover.black.svg} />
                  </Icon>
                </Button>
              }
            </Column>
          </Columns>
          <ReactTooltip
            place="right"
            effect="solid"
            id="card-action" />
        </div>
          } />
  );
};

ResourceMiniCard.contextTypes = {
  t: PropTypes.func,
};

export default ResourceMiniCard;
