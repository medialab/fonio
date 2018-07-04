/* eslint react/no-set-state : 0 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {Form, Text} from 'react-form';

import {
  Button,
  Columns,
  Column,
  Control,
  Field,
  Label,
  Help,
  HelpPin,
} from 'quinoa-design-library/components/';

class TitleForm extends Component {

  componentWillMount = () => {
    this.updateTitle(this.props.title);
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.title !== nextProps.title) {
      this.updateTitle(nextProps.title);
    }
  }

  updateTitle = title => {
    // must unmount the form to update react-form Form default values
    this.setState({title: undefined});
    setTimeout(() => this.setState({title}));
  }

  render = () => {
    const {
      props: {
        onSubmit,
      },
      state: {title},
      context: {t}
    } = this;
    const translate = translateNameSpacer(t, 'Components.TitleForm');

     const errorValidator = (values) => {
      return {
        title: !values.title ? translate('section-title-is-required') : null,
      };
    };


    const onSubmitFailure = error => {
      console.log(error);/* eslint no-console : 0 */
    };

    const onSubmitData = (values) => {
      onSubmit(values.title);
    };

    return title ? (
      <Form
        defaultValues={{title}}
        validate={errorValidator}
        onSubmitFailure={onSubmitFailure}
        onSubmit={onSubmitData}>
        {formApi => (
          <form onSubmit={formApi.submitForm}>
            <Field>
              <Control>
                <Label>
                  {translate('Section title')}
                  <HelpPin place="right">
                    {translate('Explanation about the section title')}
                  </HelpPin>
                </Label>
                <Columns>
                  <Column>
                    <Text
                      className="input"
                      field="title" id="title" type="text"
                      placeholder={translate('Section title')} />
                  </Column>
                  {formApi.values.title !== title &&
                    <Column>
                      <Button type="submit">
                        {translate('Save title')}
                      </Button>
                    </Column>
                  }
                </Columns>
              </Control>
            </Field>
            {
              formApi.errors && formApi.errors.title &&
              <Help
                isColor="danger">
                {formApi.errors.title}
              </Help>
            }
          </form>
        )}
      </Form>
    ) : null;
  }
}

TitleForm.contextTypes = {
  t: PropTypes.func,
};

export default TitleForm;
