/**
 * Payload validator middleware
 * ===================================
 * Modified from:
 *  https://github.com/MaxLi1994/redux-validator
 * Author: https://github.com/MaxLi1994
 */
const options = {
    validatorKey: 'meta',
    paramKey: 'payload'
};

export default () => ( store ) => ( next ) => ( action ) => {
  if ( !action[options.validatorKey] || !action[options.validatorKey].validator || action[options.validatorKey].disableValidate ) {
    // thunk compatible
    if ( action[options.paramKey] && action[options.paramKey].thunk ) {
        return next( action[options.paramKey].thunk );
    }
    else {
        return next( action );
    }
  }

  let flag = true;
  let errorParam, errorId, errorMsg;

  const validators = action[options.validatorKey].validator || {};
  const runValidator = ( param, func, msg, id, key ) => {
    let valid;
    if ( func ) {
        valid = func( param, store.getState(), action.payload );
    }
    else {
        throw new Error( 'validator func is needed' );
    }
    if
        ( typeof valid !== 'boolean' ) {
        throw new Error( 'validator func must return boolean type' );
    }
    if ( !valid ) {
        errorParam = key;
        errorId = id;
        errorMsg = ( typeof msg === 'function'
                    ? msg( param, store.getState(), action.payload )
                    : msg )
                    || '';
    }

    return valid;
  };

  const runValidatorContainer = ( validator, param, key ) => {
    let valid;
    if ( Array.prototype.isPrototypeOf( validator ) ) {
        for ( const j in validator ) {
            if ( validator.hasOwnProperty( j ) ) {
                const item = validator[j];
                valid = runValidator( param, item.func, item.msg, j, key );
                if ( !valid ) break;
            }
        }
    }
    else {
        valid = runValidator( param, validator.func, validator.msg, 0, key );
    }
    return valid;
  };

  const params = action[options.paramKey] || {};
  for ( const i in validators ) {
    if ( validators.hasOwnProperty( i ) ) {
        if ( i === options.paramKey || i === 'thunk' ) continue;
        const validator = validators[i];

        flag = runValidatorContainer( validator, params[i], i );
        if ( !flag ) break;
    }
  }

  // param object itself
  const paramObjValidator = validators[options.paramKey];
  if ( paramObjValidator && flag ) {
    flag = runValidatorContainer( paramObjValidator, action[options.paramKey], options.paramKey );
  }
  // -------

  if ( flag ) {
    // thunk compatible
    if ( action[options.paramKey] && action[options.paramKey].thunk ) {
        return next( action[options.paramKey].thunk );
    }
    else {
        return next( action );
    }
  }
  else {
    return next( { errors: errorMsg, type: `${action.type}_FAIL`, param: errorParam, id: errorId } );

    /*
     * return {
     *     err: 'validator',
     *     msg: errorMsg,
     *     param: errorParam,
     *     id: errorId
     * };
     */
  }
};
