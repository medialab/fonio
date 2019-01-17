/**
 * Socket middleware
 * Catch socket-related actions (triggered if they contain a meta property)
 * and pass them through the socket
 */
import { loadStoryToken } from '../helpers/localStorageUtils';

export default ( socket ) => {
  const eventName = 'action';

  return ( store ) => {
    socket.on( eventName, store.dispatch );
    return ( next ) => ( action ) => {
      if ( action.meta && action.meta.remote ) {

        // passing jwt token if a story content is involved
        const { storyId } = action.payload;
        let token;
        if ( storyId ) {
          token = loadStoryToken( storyId );
        }

        if ( action.callback && typeof action.callback === 'function' ) {
          socket.emit( eventName, { ...action, token }, action.callback );
        }
        else {
          socket.emit( eventName, { ...action, token } );
        }
      }
      return next( action );
    };
  };
};
