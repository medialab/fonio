/* eslint react/no-set-state : 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
  Button,
  Title,
  Field,
  Label,
  Control,
  Image,
  Dropdown
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../helpers/translateUtils';

import icons from 'quinoa-design-library/src/themes/millet/icons';


class LinkModal extends Component {

  static contextTypes = {
    t: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      choosenResource: undefined,
      title: '',
      url: ''
    };
  }

  componentWillReceiveProps = nextProps => {
    if (!nextProps.isActive) {
      this.setState({
        dropdownOpen: false,
        choosenResource: undefined,
        title: '',
        url: ''
      });
    }
  }

  render = () => {
    const {
      props: {
        onClose,
        hyperlinks = [],
        isActive,
        onCreateHyperlink,
        onContextualizeHyperlink,
        focusData
      },
      state: {
        dropdownOpen,
        choosenResource,
        title,
        url
      },
      context: {
        t
      }
    } = this;
    const translate = translateNameSpacer(t, 'Components.LinkModal');

    const onConfirm = () => {
      if (url && url.length) {
        onCreateHyperlink({url, title}, focusData.focusId, focusData.selection);
      }
      else {
        onContextualizeHyperlink(choosenResource, focusData.focusId, focusData.selection);
      }
    };

    const activeResource = choosenResource && hyperlinks.find(r => r.id === choosenResource);

    return (
      <ModalCard
        isActive={isActive}
        headerContent={translate('Add a hyperlink')}
        onClose={onClose}
        mainContent={
          <div>
            {hyperlinks.length > 0 &&
              <Field
                style={{
                      pointerEvents: (url && url.length) ? 'none' : 'all',
                      opacity: (url && url.length) ? 0.5 : 1
                    }}>
                <Title isSize={4}>
                  {translate('Pick an existing hyperlink from your library')}
                </Title>
                <Control>
                  <Dropdown
                    onToggle={() => this.setState({dropdownOpen: !dropdownOpen})}
                    isActive={dropdownOpen}
                    closeOnChange
                    onChange={thatId => this.setState({choosenResource: choosenResource === thatId ? undefined : thatId})}
                    value={{id: choosenResource}}
                    options={hyperlinks
                            .sort((a, b) => {
                              if (a.metadata.title > b.metadata.title) {
                                return 1;
                              }
                              return -1;
                            })
                            .map(resource => ({
                            id: resource.id,
                            label: (
                              <span style={{display: 'flex', flexFlow: 'row nowrap', alignItems: 'center'}}>
                                <Image style={{display: 'inline-block', marginRight: '1em'}} isSize={'16x16'} src={icons.webpage.black.svg} />
                                <span>
                                  {`${resource.metadata.title} (${resource.data.url})`}
                                </span>
                              </span>
                              )
                          }))}>
                    {choosenResource && activeResource ? `${activeResource.metadata.title} (${activeResource.data.url})` : translate('Choose an existing hyperlink')}
                  </Dropdown>
                </Control>
              </Field>
            }
            <div>
              <Title isSize={4}>
                {translate('Create a new hyperlink')}
              </Title>
              <Field>
                <Label>{translate('URL address')}</Label>
                <Control>
                  <input
                    className="input"
                    placeholder={translate('Hyperlink URL')}
                    value={url}
                    onChange={e => this.setState({url: e.target.value})} />
                </Control>
              </Field>
              <Field>
                <Label>{translate('Title of the webpage')}</Label>
                <Control>
                  <input
                    className="input"
                    placeholder={translate('Hyperlink title')}
                    value={title}
                    onChange={e => this.setState({title: e.target.value})} />
                </Control>
              </Field>
            </div>
          </div>
        }
        footerContent={[
          <Button
            type="submit"
            isFullWidth
            key={0}
            onClick={onConfirm}
            isDisabled={!choosenResource && !(url && url.length)}
            isColor="primary">{translate('Add hyperlink')}</Button>,
          <Button
            onClick={onClose} isFullWidth key={1}
            isColor="warning">{translate('Cancel')}</Button>,
        ]} />
    );
  }
}

export default LinkModal;
