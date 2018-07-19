/* eslint react/no-danger : 0 */
/* eslint react/prefer-stateless-function : 0 */
import React, {Component} from 'react';
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
import './ResourceCard.scss';
import {translateNameSpacer} from '../../../helpers/translateUtils';

class ResourceCard extends Component {
  render = () => {
    const {
      props: {
        resource,
        lockData,
        getTitle,
        onEdit,
        onDelete,
        isActive,
        onClick,
      },
      context: {t}
    } = this;
    const {
        data,
        metadata = {}
      } = resource;

      const {
        type,
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
      if (type === 'bib' && data && data[0]) {
        // const bibData = {
        //   [data[0].id]: data[0]
        // };
        // resourceTitle = <Bibliography items={bibData} style={apa} locale={english} />;
        resourceTitle = <div className="bib-wrapper" dangerouslySetInnerHTML={{__html: data[0].htmlPreview}} />;
      }
      else resourceTitle = getTitle(resource) || translate('untitled resource');

      return (
        <Column
          isSize={{
          mobile: 12,
          tablet: 6,
          desktop: 4,
          widescreen: 3,
        }}>
          <Card
            isActive={isActive}
            onClick={onClick}
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
              if (action === 'edit' && !lockData) {
                onEdit();
              }
              else if (action === 'delete' && !lockData) {
                onDelete();
              }
            }} />
        </Column>
      );
  }
}


ResourceCard.contextTypes = {
  t: PropTypes.func.isRequired
};


export default ResourceCard;
