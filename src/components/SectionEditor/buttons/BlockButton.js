import React, { Component } from 'react';
import { RichUtils } from 'draft-js';
import PropTypes from 'prop-types';

class BlockButton extends Component {

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
     * The block type this button is responsible for.
     */
    blockType: PropTypes.string,

    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ])
  };

  isSelected = (editorState, blockType) => {
    if (!editorState || !editorState.getSelection) {
      return;
    }
    const selection = editorState.getSelection();
    const selectedBlock = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());
    if (!selectedBlock) return false;
    const selectedBlockType = selectedBlock.getType();
    return selectedBlockType === blockType;
  };

  render = () => {

    const { 
      editorState, 
      blockType, 
      children, 
      updateEditorState,
      // iconMap,
      // ...otherProps 
    } = this.props;

    const selected = this.isSelected(editorState, blockType); 
    const className = `scholar-draft-BlockButton${selected ? ' active' : ''}`;

    const onMouseDown = (event) => {
      event.preventDefault();
      updateEditorState(RichUtils.toggleBlockType(editorState, blockType));
    };

    return (
      <div
        onMouseDown={onMouseDown}
        className={className}
      >
        {React.Children.map(
          children, 
          child => React.cloneElement(child, { 
            selected
          })
        )}
      </div>
    );
  }
}

export default BlockButton;
