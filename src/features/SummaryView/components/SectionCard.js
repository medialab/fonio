import React from 'react';
import PropTypes from 'prop-types';

import {SortableHandle} from 'react-sortable-hoc';

import {Link} from 'react-router-dom';

import config from '../../../config';

import {
  Card,
  Icon,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const SectionCard = ({
  section,
  goTo,
  lockData,
  setSectionLevel,
  // minified,
  story,
  onDelete
}, {t}) => {

  const translate = translateNameSpacer(t, 'Components.SectionCard');

  const onAction = action => {
    switch (action) {
      case 'delete':
        onDelete(section.id);
        break;
      case 'higher':
        setSectionLevel({sectionId: section.id, level: section.metadata.level - 1});
        break;
      case 'lower':
        setSectionLevel({sectionId: section.id, level: section.metadata.level + 1});
        break;
      case 'edit':
      default:
        goTo(section.id);
        break;

    }
  };
  const computeFirstWords = () => {
    if (section.contents
        && section.contents.blocks
        && section.contents.blocks[0]
        && section.contents.blocks[0].text
    ) {
      return section.contents.blocks[0].text.length > 30 ?
        <i>{`${section.contents.blocks[0].text.substr(0, 30)}...`}</i>
        :
        <i>{section.contents.blocks[0].text}</i>;
    }
    return '';
  };

  return (
    <Card
      title={<Link to={`/story/${story.id}/section/${section.id}`} >{section.metadata.title}</Link>}
      subtitle={section.metadata.subtitle}
      lockStatus={lockData ? 'locked' : 'open'}
      statusMessage={lockData ? translate('edited by {n}', {n: lockData.name}) : translate('open for edition')}
      onAction={onAction}
      bodyContent={computeFirstWords()}
      asideActions={[
        {
          label: translate('edit'),
          id: 'edit',
          isColor: 'primary',
          isDisabled: lockData
        }, {
          label: translate('move'),
          isColor: 'info',
          id: 'move',
          component: SortableHandle(() =>
            (<span style={{cursor: 'move'}} className="button is-fullwidth is-info">
              {translate('move')}
            </span>)
          )
        },
        {
          label: translate('delete'),
          isColor: 'danger',
          id: 'delete',
          isDisabled: lockData
        },

        // {
        //   label: translate('duplicate'),
        //   id: 'duplicate'
        // }
      ]}

      footerActions={[
        {
          label: [
            <Icon key={1} isSize="small" isAlign="left">
              <span className="fa fa-chevron-left" aria-hidden="true" />
            </Icon>,
              translate('higher level')
            ],
          isDisabled: section.metadata.level === 0,
          isColor: 'info',
          id: 'higher'
        },
        {
          label: [
            translate('lower level'),
            <Icon key={1} isSize="small" isAlign="right">
              <span className="fa fa-chevron-right" aria-hidden="true" />
            </Icon>
           ],
          isDisabled: section.metadata.level >= config.maxSectionLevel - 1,
          isColor: 'info',
          id: 'lower'
        }
      ]} />
  );
};

SectionCard.contextTypes = {
  t: PropTypes.func
};

export default SectionCard;
