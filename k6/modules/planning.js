/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Planning Module
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, authHeaders }           from '../config/constants.js';
import { get, post, put, del }        from '../helpers/http.js';
import { expectStatus, expectOneOfStatus,
         expectJsonField, expectDataField,
         extractId }                  from '../helpers/checks.js';
import { logOk, logFail }            from '../helpers/logger.js';
import { planningEventPayload }       from '../data/payloads.js';

const BASE = `${API}/planning`;

export function listPlanningEvents(token) {
  // /all does not require query params — use it for the generic list call
  const res = get(`${BASE}/all`, authHeaders(token), 'planning-list');
  if (expectStatus(res, 200, 'planning.list')) logOk('planning', 'list', res);
  else logFail('planning', 'list', res);
  return res;
}

export function getPlanningEventsByRange(token) {
  // The range endpoint is GET /planning?from=...&to=... (query params on the base path)
  const from = '2025-01-01T00:00:00';
  const to   = '2026-12-31T23:59:59';
  const url  = `${BASE}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res  = get(url, authHeaders(token), 'planning-range');
  if (expectStatus(res, 200, 'planning.range')) logOk('planning', 'range', res);
  else logFail('planning', 'range', res);
  return res;
}

export function getPlanningEvent(token, id) {
  const res = get(`${BASE}/${id}`, authHeaders(token), 'planning-get');
  if (expectStatus(res, 200, 'planning.get')) {
    expectJsonField(res, 'id', 'planning.get');
    logOk('planning', 'get', res);
  } else {
    logFail('planning', 'get', res, `id=${id}`);
  }
  return res;
}

export function createPlanningEvent(token) {
  const res = post(BASE, planningEventPayload(), authHeaders(token), 'planning-create');
  if (expectStatus(res, 201, 'planning.create')) {
    expectJsonField(res, 'id', 'planning.create');
    logOk('planning', 'create', res);
    return extractId(res);
  }
  logFail('planning', 'create', res);
  return null;
}

export function updatePlanningEvent(token, id) {
  const payload = { ...planningEventPayload(), title: `Updated Event ${id}` };
  const res = put(`${BASE}/${id}`, payload, authHeaders(token), 'planning-update');
  if (expectStatus(res, 200, 'planning.update')) logOk('planning', 'update', res);
  else logFail('planning', 'update', res, `id=${id}`);
  return res;
}

export function deletePlanningEvent(token, id) {
  const res = del(`${BASE}/${id}`, authHeaders(token), 'planning-delete');
  // Backend returns 204 No Content — treat 200 and 204 as success
  if (expectOneOfStatus(res, [200, 204], 'planning.delete')) {
    logOk('planning', 'delete', res);
    return true;
  }
  logFail('planning', 'delete', res, `id=${id}`);
  return false;
}

export function planningFlow(token) {
  listPlanningEvents(token);
  getPlanningEventsByRange(token);
  const id = createPlanningEvent(token);
  if (id) {
    getPlanningEvent(token, id);
    updatePlanningEvent(token, id);
    deletePlanningEvent(token, id);
  }
}
