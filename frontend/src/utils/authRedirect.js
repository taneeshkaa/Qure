/**
 * Utility functions for managing post-login redirects
 * Allows saving an intended destination before login, and retrieving it after
 */

// Key for storing redirect path in sessionStorage
const REDIRECT_PATH_KEY = 'queueease_redirect_from';

/**
 * Save the intended destination before redirecting to login
 * @param {string} pathname - The URL path to return to after login
 * @param {string} search - The URL search parameters (query string)
 */
export function saveRedirectPath(pathname, search = '') {
  const fullPath = pathname + search;
  if (fullPath && fullPath !== '/login' && fullPath !== '/register') {
    sessionStorage.setItem(REDIRECT_PATH_KEY, fullPath);
  }
}

/**
 * Get the saved redirect path and clear it from storage
 * @returns {string|null} - The saved path, or null if none was saved
 */
export function getAndClearRedirectPath() {
  const path = sessionStorage.getItem(REDIRECT_PATH_KEY);
  if (path) {
    sessionStorage.removeItem(REDIRECT_PATH_KEY);
  }
  return path;
}

/**
 * Check if user is authenticated by checking localStorage
 * @returns {boolean} - True if user has a valid token
 */
export function isAuthenticated() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

/**
 * Get the user role from localStorage
 * @returns {string|null} - The user role (e.g., 'patient', 'hospital', etc.) or null
 */
export function getUserRole() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || null;
}
