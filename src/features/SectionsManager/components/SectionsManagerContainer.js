/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the sections manager feature interface
 * @module fonio/features/SectionsManager
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {v4 as uuid} from 'uuid';
// import { DraggableDecorator } from 'draft-js-dnd-plugin';

import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';
import {unpromptResourceEmbed} from '../../StoryEditor/duck';

import {
  createDefaultSection
} from '../../../helpers/modelsUtils';

import SectionsManagerLayout from './SectionsManagerLayout';

/**
 * Redux-decorated component class rendering the sections manager feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.sectionsManager),
    ...managerDuck.selector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      unpromptResourceEmbed
    }, dispatch)
  })
)
class SectionsManagerContainer extends Component {
  /**
   * constructor
   */
  constructor(props) {
    super(props);
    this.createSection = this.createSection.bind(this);
    this.createSubSection = this.createSubSection.bind(this);
    this.updateSection = this.updateSection.bind(this);
    this.updateSectionsOrder = this.updateSectionsOrder.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  createSection() {
    const id = uuid();
    const defaultSection = createDefaultSection();
    const chapRegex = /(chap[^\d]+|sec[^\d]+|part[^\d]+)(\d)/gi;
    const lastSection = this.props.activeStory.sections[this.props.activeStory.sectionsOrder[this.props.activeStory.sectionsOrder.length - 1]];
    const lastTitle = lastSection && lastSection.metadata && lastSection.metadata.title;
    if (lastTitle) {
      if (lastTitle.match(chapRegex)) {
        const parts = chapRegex.exec(lastTitle);
        if (parts) {
          const exp = parts[1];
          const num = +parts[2];
          defaultSection.metadata.title = exp + (num + 1);
        }
      }
    }
    const {
      activeStoryId
    } = this.props;
    defaultSection.id = id;
    this.props.actions.createSection(activeStoryId, id, defaultSection, true);
  }

  createSubSection(section, index) {
    const {
      activeStoryId
    } = this.props;

    let newLevel = section.metadata.level + 1;
    newLevel = newLevel > 5 ? 5 : newLevel;
    // create section
    const id = uuid();
    const defaultSection = createDefaultSection();
    defaultSection.id = id;
    defaultSection.metadata.level = newLevel;

    this.props.actions.createSection(activeStoryId, id, defaultSection, true);

     // change order
    setTimeout(() => {
      let order = this.props.activeStory.sectionsOrder;
      const newId = order[order.length - 1];
      order =
      [
        ...order.slice(0, index + 1),
        newId,
        ...order.slice(index + 1, order.length - 1)
      ];
      this.updateSectionsOrder(order);
    }, 1);
  }

  updateSection(id, section) {
    const {
      activeStoryId
    } = this.props;
    this.props.actions.updateSection(activeStoryId, id, section);
  }

  updateSectionsOrder(order) {
    const {
      activeStoryId
    } = this.props;
    this.props.actions.updateSectionsOrder(activeStoryId, order);
  }

  render() {
    const {
      sectionsSearchQuery,
      activeStory,
      selectedSections
    } = this.props;
    let sections = activeStory.sections;
    const sectionsOrder = activeStory.sectionsOrder;
    if (sections) {
      const selectedSectionsIds = selectedSections;
      sections = sectionsOrder
      .filter(sectionKey => {
        if (selectedSectionsIds && selectedSectionsIds.length) {
         return selectedSectionsIds.indexOf(sectionKey) > -1;
        }
        else return true;
      })
      .map(id => ({...this.props.activeStory.sections[id], id}))
      .filter(section => {
        if (sectionsSearchQuery && sectionsSearchQuery.length) {
          return JSON.stringify(section.metadata).toLowerCase().indexOf(sectionsSearchQuery.toLowerCase()) > -1;
        }
        else return true;
      });
    }
    return (
      <SectionsManagerLayout
        {...this.props}
        sections={sections}
        createSection={this.createSection}
        createSubSection={this.createSubSection}
        updateSection={this.updateSection}
        updateSectionsOrder={this.updateSectionsOrder} />
    );
  }
}

export default SectionsManagerContainer;
