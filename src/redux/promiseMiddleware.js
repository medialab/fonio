/**
 * Promise middleware
 * ===================================
 * If a promise is passed in an action,
 * this middleware will resolve it and dispatch related actions names
 * (ACTION_NAME when started, then ACTION_NAME_SUCCESS or ACTION_NAME_FAIL depending on promise outcome)
 */


export default () => ({dispatch, getState}) => (next) => (action) => {
  // If the action is a function, execute it
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }

  const {promise, type, ...rest} = action;

  // If there is no promise in the action, ignore it
  if (!promise) {
    return next(action);
  }
  const REQUEST = type;
  const SUCCESS = REQUEST + '_SUCCESS';
  const FAILURE = REQUEST + '_FAIL';

  // Trigger the action (for loading indication for instance)
  next({...rest, type: REQUEST});
  return promise(dispatch, getState).then(
      (result) => {
        next({...rest, result, type: SUCCESS});
        return true;
      }
    ).catch((error) => next({...rest, ...error, errorMessage: error, type: FAILURE}));
};
