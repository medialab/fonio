/**
 * Socket middleware
 * Catch socket-related actions (triggered if they contain a meta property)
 * and pass them through the socket
 */

export default ( socket ) => {
  const eventName = 'action';

  return ( store ) => {
    socket.on( eventName, store.dispatch );
    return ( next ) => ( action ) => {
      if ( action.meta && action.meta.remote ) {
        if ( action.callback && typeof action.callback === 'function' )
          socket.emit( eventName, action, action.callback );
        else socket.emit( eventName, action );
      }
      return next( action );
    };
  };
};
