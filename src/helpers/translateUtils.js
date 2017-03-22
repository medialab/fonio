
/**
 * Automatically functions a translate function
 */
export const translateNameSpacer = (translateFn, nameSpace) => {
  return function(key, props) {
    return translateFn(nameSpace + '.' + key, props);
  };
};
