import React, {Component} from 'react';
import {RichUtils} from 'draft-js';
import PropTypes from 'prop-types';

import './ButtonStyles.scss';

import {
  Button
} from 'quinoa-design-library/components';

class InlineButton extends Component {

  static propTypes = {
    /**
     * The current editorState. This gets passed down from the editor.
     */
    editorState: PropTypes.object,

    /**
     * A method that can be called to update the editor's editorState. This
     * gets passed down from the editor.
     */
    updateEditorState: PropTypes.func,

    /**
     * The inline style type this button is responsible for.
     */
    styleType: PropTypes.string,

    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

    inlineStyleType: PropTypes.string,

    iconMap: PropTypes.object
  };

  /**
   * Checks wether current styling button is selected
   * @param {Record} editorState - editorState to check for selection
   * @param {string} inlineStyleType - inline style to inspect against the provided editorState
   * @return {boolean} isSelected -
   */
  isSelected = (editorState, inlineStyleType) => {
    if (!editorState || !editorState.getSelection) {
      return;
    }
    // Check the editor is focused
    const selection = editorState.getSelection();

    const selectedBlock = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());
    if (!selectedBlock) {
      return false;
    }

    const currentInlineStyle = editorState.getCurrentInlineStyle();
    return currentInlineStyle.has(inlineStyleType);
  };

  render = () => {

    const {
      editorState,
      updateEditorState,
      inlineStyleType,
      tooltip,
      iconMap, /* eslint  no-unused-vars:0 */
      ...otherProps
    } = this.props;

    const selected = this.isSelected(editorState, inlineStyleType);
    // const className = `scholar-draft-InlineButton${selected ? ' active' : ''} `;

    const onMouseDown = (event) => {
      event.preventDefault();
      updateEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyleType));
    };

    return (
      <Button
        onMouseDown={onMouseDown}
        isColor={selected ? 'info' : ''}
        // className={className}
        data-tip={tooltip}
        data-for="style-button"
        {...otherProps}>
        {React.Children.map(
          this.props.children,
          child => React.cloneElement(child, {
            selected
          })
        )}
      </Button>
    );
  };
}

export default InlineButton;
