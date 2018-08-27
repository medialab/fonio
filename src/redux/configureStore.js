/**
 * Fonio store configuration
 * ===================================
 * Configuring store with appropriate middlewares
 */
import {
  applyMiddleware,
  createStore,
  compose
} from 'redux';
import rootReducer from './rootReducer';
import promiseMiddleware from './promiseMiddleware';
import Validator from './payloadValidatorMiddleware';
import {loadingBarMiddleware} from 'react-redux-loading-bar';

import {CONNECT_ERROR, RECONNECT} from '../features/ErrorMessageManager/duck';

import config from '../config';

import io from 'socket.io-client';
import createSocketIoMiddleware from './socketIoMiddleware';

import {splitPathnameForSockets} from '../helpers/misc';

/**
 * @todo: fetch that from config
 */
const [apiOrigin, apiPathname] = splitPathnameForSockets(config.apiUrl);
const path = '/' + apiPathname.concat('sockets').join('/');

const socket = io(apiOrigin, {path});

const socketIoMiddleware = createSocketIoMiddleware(socket);

/**
 * redux action validator middleware
 */
const validatorMiddleware = Validator();

/**
 * Configures store with a possible inherited state and appropriate reducers
 * @param initialState - the state to use to bootstrap the reducer
 * @return {object} store - the configured store
 */
export default function configureStore (initialState = {}) {
  // Compose final middleware with thunk and promises handling
  const middleware = applyMiddleware(
    validatorMiddleware,
    socketIoMiddleware,
    promiseMiddleware(),
    loadingBarMiddleware({
      promiseTypeSuffixes: ['PENDING', 'SUCCESS', 'FAIL'],
    })
  );

  // Create final store and subscribe router in debug env ie. for devtools
  const createStoreWithMiddleware = window.__REDUX_DEVTOOLS_EXTENSION__ ? compose(
    // related middlewares
    middleware,
    // connection to redux dev tools
    window.__REDUX_DEVTOOLS_EXTENSION__())(createStore) : compose(middleware)(createStore);

  const store = createStoreWithMiddleware(
    rootReducer,
    initialState,
  );

  const connectionErrors = ['connect_error', 'reconnect_failed', 'reconnect_error'];
  connectionErrors.forEach(message => {
    socket.on(message, error => {
      store.dispatch({
        type: CONNECT_ERROR,
        error
      });
    });
});

socket.on('reconnect', error => {
  store.dispatch({
    type: RECONNECT,
    error
  });
});


  // live-reloading handling
  if (module.hot) {
    module.hot.accept('./rootReducer', () => {
      const nextRootReducer = require('./rootReducer').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
