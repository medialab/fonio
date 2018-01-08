/**
 * This module helps to load files from app server or user own file system
 * @module fonio/helpers/formValidator
 */
/**
 * Validates whether the form is valid
 *
 */
export default function validateForm (field, value) {
  const errors = {};
  switch (field) {
    case 'title':
      errors.title = value.length === 0 ? 'enter a title' : undefined;
      break;
    case 'password':
      errors.password = value.length < 6 ? 'enter a password' : undefined;
      break;
    case 'authors':
      const authors = value.filter(d => d.length > 0);
      errors.authors = authors.length === 0 ? 'enter an author' : undefined;
      break;
    default:
      break;
  }
  return errors;
}
