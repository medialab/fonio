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
import autoSaveMiddleware from './autoSaveMiddleware';
import {persistentStore} from 'redux-pouchdb';
import {loadingBarMiddleware} from 'react-redux-loading-bar';

const PouchDB = require('pouchdb').default;
const db = new PouchDB('fonio');

/**
 * Configures store with a possible inherited state and appropriate reducers
 * @param initialState - the state to use to bootstrap the reducer
 * @return {object} store - the configured store
 */
export default function configureStore (initialState = {}) {
  // Compose final middleware with thunk and promises handling
  const middleware = applyMiddleware(
    autoSaveMiddleware(),
    promiseMiddleware(),
    loadingBarMiddleware({
      promiseTypeSuffixes: ['PENDING', 'SUCCESS', 'FAIL'],
    })
  );

  // Create final store and subscribe router in debug env ie. for devtools
  const createStoreWithMiddleware = window.__REDUX_DEVTOOLS_EXTENSION__ ? compose(
    // related middlewares
    middleware,
    // connections to pouchdb
    persistentStore(db),
    // connection to redux dev tools
    window.__REDUX_DEVTOOLS_EXTENSION__())(createStore) : compose(middleware, persistentStore(db))(createStore);

  const store = createStoreWithMiddleware(
    rootReducer,
    initialState,
  );
  // live-reloading handling
  if (module.hot) {
    module.hot.accept('./rootReducer', () => {
      const nextRootReducer = require('./rootReducer').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
