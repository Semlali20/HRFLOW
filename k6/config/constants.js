/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared Constants — HRFLOW k6 Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads BASE_URL from the k6 environment variable so you can target any
 * environment without editing source files:
 *
 *   k6 run --env BASE_URL=https://api.prod.example.com main.js
 */

// Base URL — falls back to localhost if not provided via --env
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8090';

// API prefix (matches Spring Boot controller mappings)
export const API      = `${BASE_URL}/api/v1`;

// Default JSON headers (add Authorization after login)
export const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// Build auth headers with a JWT token
export function authHeaders(token) {
  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${token}`,
  };
}

// Realistic sleep ranges (seconds) to simulate human think-time
export const THINK_TIME = {
  SHORT:  { min: 0.3, max: 0.8 },
  MEDIUM: { min: 0.5, max: 1.5 },
  LONG:   { min: 1.0, max: 3.0 },
};

// HTTP status codes used in checks
export const HTTP = {
  OK:         200,
  CREATED:    201,
  NO_CONTENT: 204,
  BAD_REQUEST:      400,
  UNAUTHORIZED:     401,
  FORBIDDEN:        403,
  NOT_FOUND:        404,
  CONFLICT:         409,
};
