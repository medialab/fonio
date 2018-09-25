
export const getStatePropFromActionSet = ( actionName ) => {
  return actionName.replace( 'SET_', '' ).toLowerCase().replace( /(_[a-z])/gi, ( a, b ) => b.substr( 1 ).toUpperCase() );
};
