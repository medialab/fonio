import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import ReactTooltip from 'react-tooltip';

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
  resource,
  onEdit
}, {t}) => {
  const translate = translateNameSpacer(t, 'Features.SectionView');

  return (
    <Card
      key={resource.id}
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
                lockStatus={'open'}
                statusMessage={'open'} />
            </Column>
          </Columns>
          <Columns>
            <Column isOffset={2} isSize={10}>
              <Button data-for="card-action" data-tip={translate('drag this card to the editor')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.move.black.svg} />
                </Icon>
              </Button>
              <Button onClick={onEdit} data-for="card-action" data-tip={'settings'}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.settings.black.svg} />
                </Icon>
              </Button>
              <Button data-for="card-action" data-tip={translate('delete this resource')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.remove.black.svg} />
                </Icon>
              </Button>
              <Button data-for="card-action" data-tip={translate('use as cover image')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.cover.black.svg} />
                </Icon>
              </Button>
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
