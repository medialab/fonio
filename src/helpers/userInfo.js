import userNames from '../sharedAssets/userNames';
import avatars from '../sharedAssets/avatars';

/**
 * Generates random values for user name
 * @param {string} lang - the lang to use to generate info
 */
export default function generateRandomUserInfo ( lang ) {
  const { adjectives, names, pattern } = userNames[lang];
  const adjective = adjectives[parseInt( Math.random() * adjectives.length, 10 )];
  const name = names[parseInt( Math.random() * names.length, 10 )].toLowerCase();
  const avatar = avatars[parseInt( Math.random() * avatars.length, 10 )];
  return {
    name: pattern.replace( 'adjective', adjective ).replace( 'name', name ),
    avatar,
  };
}
