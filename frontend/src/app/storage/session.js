/**
 * @param {string} accessToken - the access token
 * @returns {Error} an error or null if no error.
 **/
export function storeAccessToken(accessToken) {
  try {
    sessionStorage.setItem('accessToken', accessToken);
    return null;
  } catch (_) {
    return new Error('unable to save access token');
  }
}
