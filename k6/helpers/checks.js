/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Check Helpers — Composable response assertions for k6
 * ─────────────────────────────────────────────────────────────────────────────
 * Each function wraps k6's `check()` and returns true/false so callers can
 * branch logic on assertion results.
 *
 * Example:
 *   const res = post(loginUrl, payload);
 *   if (!expectStatus(res, 200, 'login')) return;     // stop on auth failure
 *   expectJsonField(res, 'accessToken', 'login token');
 */

import { check } from 'k6';

// ── Status code assertion ──────────────────────────────────────────────────────
export function expectStatus(res, status, label = '') {
  return check(res, {
    [`${label} → status ${status}`]: (r) => r.status === status,
  });
}

// ── Status is any of the given codes ──────────────────────────────────────────
export function expectOneOfStatus(res, statuses, label = '') {
  return check(res, {
    [`${label} → status in [${statuses.join(',')}]`]: (r) => statuses.includes(r.status),
  });
}

// ── Body is not empty ─────────────────────────────────────────────────────────
export function expectBody(res, label = '') {
  return check(res, {
    [`${label} → body not empty`]: (r) => r.body && r.body.length > 0,
  });
}

// ── JSON body contains a top-level field ──────────────────────────────────────
export function expectJsonField(res, field, label = '') {
  return check(res, {
    [`${label} → body has '${field}'`]: (r) => {
      try {
        const json = r.json();
        return json !== null && json[field] !== undefined;
      } catch (_) {
        return false;
      }
    },
  });
}

// ── JSON body's `data` field contains a specific key ──────────────────────────
// Matches the ApiResponse<T> wrapper: { data: { ... } }
export function expectDataField(res, field, label = '') {
  return check(res, {
    [`${label} → data.${field} exists`]: (r) => {
      try {
        const json = r.json();
        return json && json.data && json.data[field] !== undefined;
      } catch (_) {
        return false;
      }
    },
  });
}

// ── JSON body's `data` is an array with at least one item ─────────────────────
export function expectDataArray(res, label = '') {
  return check(res, {
    [`${label} → data is non-empty array`]: (r) => {
      try {
        const json = r.json();
        // Handles both ApiResponse<List> → data[] and PagedResponse → content[]
        const arr = json.data || json.content || json;
        return Array.isArray(arr) && arr.length >= 0; // 0 is OK (may be empty DB)
      } catch (_) {
        return false;
      }
    },
  });
}

// ── Response time below threshold (ms) ────────────────────────────────────────
export function expectFastResponse(res, maxMs = 800, label = '') {
  return check(res, {
    [`${label} → response < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

// ── Composite: status + body + speed — the most common assertion triplet ───────
export function expectOk(res, expectedStatus, label = '') {
  expectStatus(res, expectedStatus, label);
  expectBody(res, label);
  expectFastResponse(res, 800, label);
}

// ── Extract a value safely from ApiResponse.data ──────────────────────────────
export function extractData(res, field) {
  try {
    const json = res.json();
    if (json && json.data && json.data[field] !== undefined) {
      return json.data[field];
    }
    // Direct field (e.g. accessToken in JwtResponse)
    if (json && json[field] !== undefined) {
      return json[field];
    }
    return null;
  } catch (_) {
    return null;
  }
}

// ── Extract id from ApiResponse.data.id ───────────────────────────────────────
export function extractId(res) {
  return extractData(res, 'id');
}
