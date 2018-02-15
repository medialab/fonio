/**
 * Autosave middleware
 * ===================================
 * Checks whether changes were made about active story.
 * If so, triggers a debounced autosave call
 */
import {saveStory} from '../features/StoriesManager/duck';

export default () => ({dispatch, getState}) => (next) => (action) => {
  const previousActiveStory = getState().stories.stories.activeStory;
  const result = next(action);
  const story = getState().stories.stories.activeStory;

  if (previousActiveStory !== story && previousActiveStory && story && previousActiveStory.id === story.id) {
    // save
    const token = localStorage.getItem(story.id);
    dispatch(saveStory(story, token));
  }
  return result;
};
