/**
 * This module exports a stateless component rendering the layout of the configuration dialog feature interface
 * @module fonio/features/ConfigurationDialog
 */
import React from 'react';
import PropTypes from 'prop-types';

import Textarea from 'react-textarea-autosize';
import {Form, Text} from 'react-form';
import {range} from 'lodash';

import HelpPin from '../../../components/HelpPin/HelpPin';
import AuthorsManager from '../../../components/AuthorsManager/AuthorsManager';
import Toaster from '../../../components/Toaster/Toaster';
import OptionSelect from '../../../components/OptionSelect/OptionSelect';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import './ConfigurationDialog.scss';

import config from '../../../../config';
const {maxSectionLevel} = config;

/**
 * Renders the configuration dialog layout
 * @param {object} props - the props to render
 * @param {object} props.storyCandidate - the data of the story to configure
 * @param {object} props.actions - actions from the redux logic
 * @param {function} props.closeStoryCandidate - function to trigger for closing the story
 * @return {ReactElement} markup
 */

// const AuthorsManagerInput = FormField(AuthorsManager);
const ConfigurationDialogLayout = ({
  activeStoryId,
  storyCandidate,
  createStoryLog,
  createStoryLogStatus,
  // router props
  history,
  actions: {
    applyStoryCandidateConfiguration,
    createStory
  },
  closeStoryCandidate,
}, context) => {
  // namespacing the translation keys with feature id
  const translate = translateNameSpacer(context.t, 'Features.ConfigurationDialog');
  const levelValues = range(maxSectionLevel).map(d => {
    return {
      value: d.toString(),
      label: (d + 1).toString()
    };
  });

  /**
   * Callbacks
   */
  const errorValidator = (values) => {
    return {
      title: !values.title ? 'story title is required' : null,
      password: (!activeStoryId && (!values.password || values.password.length < 6)) ? 'password should be at least 6 charactors' : null,
      authors: values.authors.length < 1 ? 'enter a author name' : null
    };
  };

  const validatorFail = (errors, formApi) => {
    formApi.setTouched('authors', true);
  };
  const onApplyChange = (values) => {
    const newStoryCandidate = {
      ...storyCandidate,
      metadata: {
        ...storyCandidate.metadata,
        ...values
      }
    };
    if (activeStoryId) {
      applyStoryCandidateConfiguration(newStoryCandidate);
    }
    else {
      createStory(newStoryCandidate, values.password)
     .then((res) => {
        if (res.result) {
          const {story} = res.result;
          applyStoryCandidateConfiguration(story);
          history.push({
            pathname: `/story/${story.id}/edit`
          });
        }
      });
    }
  };
  // todo this is temporary and should be replaced by a test
  const storyBegan = localStorage.getItem(activeStoryId);

  return (
    <div className="fonio-ConfigurationDialogLayout">
      <h1 className="modal-header">
        {translate('story-configuration')}
      </h1>
      <Form
        defaultValues={storyCandidate.metadata}
        validateError={errorValidator}
        onSubmitFailure={validatorFail}
        onSubmit={onApplyChange}>
        {formApi => (
          <form onSubmit={formApi.submitForm} id="login-form" className="fonio-form">
            <section className="modal-content">
              <section className="modal-row">
                <h2>{translate('what-is-your-story-about')}
                  <HelpPin>
                    {translate('what-is-your-story-about-help')}
                  </HelpPin>
                </h2>
                <div className="modal-columns-container">
                  <div className="modal-column">
                    <div className="input-group">
                      <label htmlFor="title" className="label">{translate('title-of-the-story')}*</label>
                      <Text
                        field="title" id="title" type="text"
                        placeholder={translate('title-of-the-story')} />
                      {formApi.touched.title &&
                        <Toaster status={formApi.errors.title && 'failure'} log={formApi.errors.title} />
                      }
                    </div>
                    {!storyBegan &&
                      <div className="input-group">
                        <label htmlFor="password" className="label">password*</label>
                        <Text
                          field="password"
                          id="password"
                          type="password"
                          placeholder="password" />
                        {formApi.touched.password &&
                          <Toaster status={formApi.errors.password && 'failure'} log={formApi.errors.password} />
                        }
                      </div>
                    }
                    <div className="input-group">
                      <label htmlFor="authors">{translate('authors-of-the-story')}*</label>
                      <AuthorsManager
                        field="authors"
                        id="authors"
                        onChange={(authors) => formApi.setValue('authors', authors)}
                        authors={formApi.getValue('authors')} />
                      {formApi.touched.authors &&
                        <Toaster status={formApi.errors.authors && 'failure'} log={formApi.errors.authors} />
                      }
                    </div>
                    <div className="input-group" style={{flex: 1}}>
                      <label htmlFor="description">{translate('description-of-the-story')}</label>
                      <Textarea
                        field="description"
                        id="description"
                        type="text"
                        placeholder={translate('description-of-the-story')}
                        style={{flex: 1}} />
                    </div>
                    <div className="input-group">
                      <label htmlFor="sectionLevel">level of sections</label>
                      <OptionSelect
                        activeOptionId={formApi.getValue('sectionLevel')}
                        options={levelValues}
                        onChange={(level) => formApi.setValue('sectionLevel', level)}
                        title={'choose a maximum number of the story sections'} />
                    </div>
                  </div>
                  <Toaster status={createStoryLogStatus} log={createStoryLog} />
                </div>
              </section>
            </section>
            <section className="modal-footer">
              {
                storyCandidate
              ?
                <button
                  type="submit"
                  className="valid-btn">{storyBegan /* todo : change to test if story is began */ ? translate('apply-changes-and-continue-story-edition') : translate('start-to-edit-this-story')}
                </button>
              : ''
            }
              <button
                className="cancel-btn"
                onClick={closeStoryCandidate}>
                {translate('cancel')}
              </button>
            </section>
          </form>
        )}
      </Form>
    </div>
  );
};


/**
 * Context data used by the component
 */
ConfigurationDialogLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default ConfigurationDialogLayout;
