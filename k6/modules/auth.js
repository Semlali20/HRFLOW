/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth Module — Login, refresh, logout, password change
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, JSON_HEADERS, authHeaders } from '../config/constants.js';
import { post, put }                      from '../helpers/http.js';
import { expectStatus, expectJsonField,
         expectDataField, extractData }   from '../helpers/checks.js';
import { logOk, logFail, logDebug }       from '../helpers/logger.js';

const BASE = `${API}/auth`;

/**
 * Login and return the JWT token string.
 * Returns null on failure so callers can skip protected steps gracefully.
 */
export function login(email, password) {
  const res = post(
    `${BASE}/login`,
    { email, password },
    JSON_HEADERS,
    'auth-login',
  );

  const ok = expectStatus(res, 200, 'auth.login');
  expectJsonField(res, 'accessToken', 'auth.login');

  if (!ok) {
    logFail('auth', 'login', res, `email=${email}`);
    return null;
  }

  const token = res.json().accessToken;
  logOk('auth', 'login', res);
  logDebug('auth', `token obtained for ${email} (length=${token.length})`);
  return token;
}

/**
 * Register a new user (Admin only).
 * Returns the response for further assertions.
 */
export function register(token, userData) {
  const res = post(
    `${BASE}/register`,
    userData,
    authHeaders(token),
    'auth-register',
  );

  if (expectStatus(res, 201, 'auth.register')) {
    logOk('auth', 'register', res);
  } else {
    logFail('auth', 'register', res);
  }

  return res;
}

/**
 * Refresh the access token using a refresh token.
 * Returns new access token string or null.
 */
export function refreshToken(refreshTokenStr) {
  const res = post(
    `${BASE}/refresh`,
    { refreshToken: refreshTokenStr },
    JSON_HEADERS,
    'auth-refresh',
  );

  if (expectStatus(res, 200, 'auth.refresh')) {
    logOk('auth', 'refresh', res);
    return res.json().token || null; // MessageResponse.token
  }

  logFail('auth', 'refresh', res);
  return null;
}

/**
 * Change password for the currently authenticated user.
 */
export function changePassword(token, currentPassword, newPassword) {
  const res = put(
    `${BASE}/password`,
    { currentPassword, newPassword },
    authHeaders(token),
    'auth-change-password',
  );

  if (expectStatus(res, 200, 'auth.changePassword')) {
    logOk('auth', 'changePassword', res);
    return true;
  }

  logFail('auth', 'changePassword', res);
  return false;
}

/**
 * Logout the current user (invalidates refresh token).
 */
export function logout(token) {
  const res = post(
    `${BASE}/logout`,
    {},
    authHeaders(token),
    'auth-logout',
  );

  // Backend returns 204 No Content on successful logout
  if (expectStatus(res, 204, 'auth.logout')) {
    logOk('auth', 'logout', res);
    return true;
  }

  logFail('auth', 'logout', res);
  return false;
}
