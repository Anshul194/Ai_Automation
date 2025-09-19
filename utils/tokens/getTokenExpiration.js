import jwt from 'jsonwebtoken';
/**
 * Returns the expiration time (in ms) of a JWT token, or null if not present/invalid.
 * @param {string} token
 * @returns {number|null}
 */

// Get Token Expiration
function getTokenExpiration(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded && decoded.exp ? decoded.exp * 1000 : null;
  } catch (error) {
    return null;
  }
}

export { getTokenExpiration };