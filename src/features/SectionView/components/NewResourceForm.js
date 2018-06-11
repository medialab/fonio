import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {
  Column,
  Columns,
  Control,
  Field,
  HelpPin,
  Input,
  Label,
  Level,
  TextArea,
  Title,
} from 'quinoa-design-library/components/';


const NewResourceForm = ({

}, {t}) => {
  const translate = translateNameSpacer(t, 'Features.SectionView');

  return (
    <div>
      <Columns>
        <Column>
          <Field>
            <Control>
              <Label>
                {translate('Url of the video')}
                <HelpPin place="right">
                  {translate('Explanation about the video url')}
                </HelpPin>
              </Label>
              <Input type="text" placeholder={translate('Video url')} />
            </Control>
          </Field>
        </Column>
        <Column>
          <Title isSize={5}>
            {translate('Preview')}
          </Title>
          <iframe
            src="https://www.youtube.com/embed/QHDRRxKlimY?rel=0&amp;controls=0&amp;showinfo=0" frameBorder="0" allow="autoplay; encrypted-media"
            allowFullScreen />
        </Column>
      </Columns>
      <Level />
      <Columns>
        <Column>
          <Field>
            <Control>
              <Label>
                {translate('Title of the video')}
                <HelpPin place="right">
                  {translate('Explanation about the video title')}
                </HelpPin>
              </Label>
              <Input type="text" placeholder={translate('Video title')} />
            </Control>
          </Field>
          <Field>
            <Control>
              <Label>
                {translate('Source of the video')}
                <HelpPin place="right">
                  {translate('Explanation about the video source')}
                </HelpPin>
              </Label>
              <Input type="text" placeholder={translate('Video source')} />
            </Control>
          </Field>
        </Column>
        <Column>
          <Field>
            <Control>
              <Label>
                {translate('Description of the video')}
                <HelpPin place="right">
                  {translate('Explanation about the video description')}
                </HelpPin>
              </Label>
              <TextArea type="text" placeholder={translate('Video description')} />
            </Control>
          </Field>
        </Column>
      </Columns>
    </div>
  );
};

NewResourceForm.contextTypes = {
  t: PropTypes.func,
};

export default NewResourceForm;
