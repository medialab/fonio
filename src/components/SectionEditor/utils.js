import {
  EditorState,
  Modifier,
  convertToRaw,
} from 'draft-js';

import {
  constants
} from 'scholar-draft';

const {
  INLINE_ASSET,
} = constants;


import defaultStyle from 'raw-loader!./assets/apa.csl';
import defaultLocale from 'raw-loader!./assets/english-locale.xml';


/**
 * Retrieve proper citation styling models from a story
 * @return {object} proper models
 */
export const getCitationModels = story => {
  const style = (story &&
                          story.settings &&
                          story.settings.citationStyle &&
                          story.settings.citationStyle.data
                        )
                          || defaultStyle;
    const locale = (story &&
                          story.settings &&
                          story.settings.citationLocale &&
                          story.settings.citationLocale.data
                        )
                          || defaultLocale;
  return {style, locale};
};

/**
 * Builds citation data for react-citeproc
 * @return {object} formatted data
 */
export const buildCitations = (assets, props) => {
  const {
    activeStory: {
      contextualizations,
      resources,
      contextualizers
    },
    activeSection
  } = props;
  /*
     * Citations preparation
     */
    // isolate bib contextualizations
    const bibContextualizations = Object.keys(assets)
    .filter(assetKey =>
        assets[assetKey].type === 'bib'
        && assets[assetKey].sectionId === activeSection.id
      )
    .map(assetKey => assets[assetKey]);

    // build citations items data
    const citationItems = Object.keys(bibContextualizations)
      .reduce((finalCitations, key1) => {
        const bibCit = bibContextualizations[key1];
        const citations = bibCit.resource.data;
        const newCitations = citations.reduce((final2, citation) => {
          return {
            ...final2,
            [citation.id]: citation
          };
        }, {});
        return {
          ...finalCitations,
          ...newCitations,
        };
      }, {});

    // build citations's citations data
    const citationInstances = bibContextualizations // Object.keys(bibContextualizations)
      .map((bibCit, index) => {
        const key1 = bibCit.id;
        const contextualization = contextualizations[key1];

        const contextualizer = contextualizers[contextualization.contextualizerId];
        const resource = resources[contextualization.resourceId];
        return {
          citationID: key1,
          citationItems: resource.data.map(ref => ({
            locator: contextualizer.locator,
            prefix: contextualizer.prefix,
            suffix: contextualizer.suffix,
            // ...contextualizer,
            id: ref.id,
          })),
          properties: {
            noteIndex: index + 1
          }
        };
      }).filter(c => c);
    // map them to the clumsy formatting needed by citeProc
    // todo: refactor the citationInstances --> citeProc-formatted data as a util
    const citationData = citationInstances.map((instance, index) => [
      instance,
      // citations before
      citationInstances.slice(0, (index === 0 ? 0 : index))
        .map((oCitation) => [
            oCitation.citationID,
            oCitation.properties.noteIndex
          ]
        ),
      []
      // citations after (not using it seems to work anyway)
      // citationInstances.slice(index)
      //   .map((oCitation) => [
      //       oCitation.citationID,
      //       oCitation.properties.noteIndex
      //     ]
      //   ),
    ]);

    return {citationItems, citationData};
};

/**
   * Add plain text in one of the editor states (main or note)
   * @param {string} text - text to add
   * @param {string} contentId - 'main' or noteId
   */
export const addTextAtCurrentSelection = (text, contentId, props) => {
    const {
      activeSection,
      activeStoryId,
      sectionId,
      editorStates,
      updateDraftEditorState,
      updateSection,
    } = props;
    const editorState = contentId === 'main' ? editorStates[sectionId] : editorStates[contentId];
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    const newContentState = Modifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      text,
    );
    let newSection;
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-text'
    );
    updateDraftEditorState(editorStateId, newEditorState);
    if (contentId === 'main') {
      newSection = {
        ...activeSection,
        contents: convertToRaw(newEditorState.getCurrentContent())
      };
    }
    else {
      newSection = {
        ...activeSection,
        notes: {
          ...activeSection.notes,
          [contentId]: {
            ...activeSection.notes[contentId],
            contents: convertToRaw(newEditorState.getCurrentContent())
          }
        }
      };
    }
    updateSection(activeStoryId, sectionId, newSection);
  };

/**
 * Format story data as assets
 * @return {object} assets
 */
export const computeAssets = (props) => {
  const {
      story: {
        contextualizers,
        contextualizations,
        resources
    }
  } = props;
  const assets = Object.keys(contextualizations)
  .reduce((ass, id) => {
    const contextualization = contextualizations[id];
    const contextualizer = contextualizers[contextualization.contextualizerId];
    return {
      ...ass,
      [id]: {
        ...contextualization,
        resource: resources[contextualization.resourceId],
        contextualizer,
        type: contextualizer ? contextualizer.type : INLINE_ASSET
      }
    };
  }, {});

  return assets;
};

/**
 * Computes assets choices menu data and callback
 */
export const computeAssetChoiceProps = props => {
  const {
    story: {
      resources
    },
    setEditorFocus,
    cancelAssetRequest,
  } = props;
  return {
    options: Object.keys(resources).map(key => resources[key]),
    addPlainText: (text, contentId) => {
      addTextAtCurrentSelection(text, contentId, props);
      cancelAssetRequest();
      setEditorFocus(undefined);
      setTimeout(() => {
        setEditorFocus(contentId);
      });
    }
  };
};

