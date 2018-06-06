export default (socket) => {
  const eventName = 'action';
  return (store) => {
    socket.on(eventName, store.dispatch);
    return next => (action) => {
      if (action.meta && action.meta.remote) {
        socket.emit(eventName, action);
      }
      return next(action);
    };
  };
};
