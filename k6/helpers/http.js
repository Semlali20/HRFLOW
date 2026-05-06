/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HTTP Helper — Thin wrappers around k6's built-in http module
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralises request logic so every module benefits from:
 *   - Automatic JSON serialisation
 *   - Consistent tag naming (for Grafana/InfluxDB dashboards)
 *   - Response-time tracking per endpoint group
 */

import http from 'k6/http';
import { JSON_HEADERS } from '../config/constants.js';

// ── Internal helper: build k6 params (headers + tags) ─────────────────────────
function params(headers, tag) {
  return {
    headers: headers || JSON_HEADERS,
    tags: { name: tag || 'untagged' },
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────
export function get(url, headers, tag) {
  return http.get(url, params(headers, tag));
}

// ── POST (JSON body) ───────────────────────────────────────────────────────────
export function post(url, payload, headers, tag) {
  return http.post(
    url,
    JSON.stringify(payload),
    params(headers, tag),
  );
}

// ── PUT (JSON body) ────────────────────────────────────────────────────────────
export function put(url, payload, headers, tag) {
  return http.put(
    url,
    JSON.stringify(payload),
    params(headers, tag),
  );
}

// ── PATCH (JSON body) ──────────────────────────────────────────────────────────
export function patch(url, payload, headers, tag) {
  return http.patch(
    url,
    JSON.stringify(payload),
    params(headers, tag),
  );
}

// ── DELETE ─────────────────────────────────────────────────────────────────────
export function del(url, headers, tag) {
  return http.del(url, null, params(headers, tag));
}

// ── Multipart file upload ──────────────────────────────────────────────────────
// k6 sends multipart/form-data when the value is http.file(...)
export function uploadFile(url, formData, headers, tag) {
  // Strip Content-Type so k6 sets the correct multipart boundary automatically
  const h = { ...(headers || {}) };
  delete h['Content-Type'];
  return http.post(url, formData, { headers: h, tags: { name: tag || 'upload' } });
}

// ── Safe JSON parse — returns null instead of throwing ────────────────────────
export function parseJson(response) {
  try {
    return response.json();
  } catch (_) {
    return null;
  }
}
