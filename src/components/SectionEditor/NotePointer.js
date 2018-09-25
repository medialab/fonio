/* eslint react/no-did-mount-set-state : 0 */
/* eslint react/no-set-state : 0 */

import {
  Tag
} from 'quinoa-design-library/components';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NotePointer extends Component {

  static contextTypes = {
    emitter: PropTypes.object,
    notes: PropTypes.object,

    onNotePointerMouseOver: PropTypes.func,
    onNotePointerMouseOut: PropTypes.func,
    onNotePointerMouseClick: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {};
  }

  componentDidMount() {
    this.setState( {
      note: this.context.notes && this.context.notes[this.props.noteId]
    } );
    this.unsubscribe = this.context.emitter.subscribeToNotes( ( notes ) => {
      const note = notes[this.props.noteId];
      if ( !this.state.note || ( note && note.order !== this.state.note.order ) ) {
        this.setState( {
          note
        } );
      }
    } );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render = () => {
    const {
      note
    } = this.state;

    const {
      onNotePointerMouseOver,
      onNotePointerMouseOut,
      onNotePointerMouseClick,
    } = this.context;

    /*
     * note:  it was necessary to display component children
     * to avoid weird selection bugs implying this component.
     * this should be solved with draft-js@0.11
     * see https://github.com/facebook/draft-js/issues/627
     */
    const {
      children/* eslint react/prop-types : 0 */
    } = this.props;

    const onMouseOver = ( event ) => {
      event.stopPropagation();
      if ( typeof onNotePointerMouseOver === 'function' && note ) {
        onNotePointerMouseOver( note.id, note, event );
      }
    };

    const onMouseOut = ( event ) => {
      event.stopPropagation();
      if ( typeof onNotePointerMouseOut === 'function' && note ) {
        onNotePointerMouseOut( note.id, note, event );
      }
    };

    const onMouseClick = ( event ) => {
      event.stopPropagation();
      if ( typeof onNotePointerMouseClick === 'function' && note ) {
        onNotePointerMouseClick( note.id, note, event );
      }
    };

    const id = note && note.id ? `note-pointer-${note.id}` : 'note-pointer-orphan';

    return (
      <sup
        id={ id }
        contentEditable={ false }
        onMouseOver={ onMouseOver }
        onFocus={ onMouseOver }
        onMouseOut={ onMouseOut }
        onBlur={ onMouseOut }
        onClick={ onMouseClick }
      >
        <Tag
          style={ { transform: 'scale(.7)' } }
          className={ 'is-clickable is-rounded' }
          isColor={ 'info' }
        >{( note && note.order ) || '*'}{children}
        </Tag>
      </sup>
    );
  }
}

NotePointer.propTypes = {
  noteId: PropTypes.string
};

export default NotePointer;
