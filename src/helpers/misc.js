

export const abbrevString = (str, maxLength = 10) => {
  if (str.length > maxLength) {
   return str.substr(0, maxLength) + '...';
  }
  return str;
};
