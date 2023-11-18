/**
 * @param {object} user - user object
 * @returns {Error} an error or null if no error.
 **/
export function storeUserInformation(user) {
  try {
    localStorage.setItem('user', user);
    return null;
  } catch (_) {
    return new Error('unable to save user information');
  }
}
