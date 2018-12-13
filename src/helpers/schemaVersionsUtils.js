import { templates } from 'quinoa-story-player';

export const getTemplateName = ( story ) => {
  if ( story.metadata.version === '1.1' ) {
    return story.settings.templateId;
  }
  return story.settings.template;
};

/**
 * @param {Story} story
 * With the new tempate format, the `tempate` property was renamed `tempateId`
 */
export const findTempateByVersion = ( story ) => {
  const templateId = getTemplateName( story );
  return templates.find( ( thatTemplate ) => thatTemplate.id === templateId );
};
