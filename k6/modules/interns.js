/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Interns Module
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, authHeaders }           from '../config/constants.js';
import { get, post, put, patch, del } from '../helpers/http.js';
import { expectStatus, expectDataField,
         extractId }                  from '../helpers/checks.js';
import { logOk, logFail, logSkip }   from '../helpers/logger.js';
import { internPayload }              from '../data/payloads.js';

const BASE = `${API}/interns`;

export function listInterns(token, search = null, status = null) {
  let url = BASE;
  const params = [];
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (status) params.push(`status=${status}`);
  if (params.length) url += '?' + params.join('&');

  const res = get(url, authHeaders(token), 'interns-list');
  if (expectStatus(res, 200, 'interns.list')) {
    logOk('interns', 'list', res);
  } else {
    logFail('interns', 'list', res);
  }
  return res;
}

export function getIntern(token, id) {
  const res = get(`${BASE}/${id}`, authHeaders(token), 'interns-get');
  if (expectStatus(res, 200, 'interns.get')) {
    expectDataField(res, 'id', 'interns.get');
    logOk('interns', 'get', res);
  } else {
    logFail('interns', 'get', res, `id=${id}`);
  }
  return res;
}

/** Returns new intern ID or null. */
export function createIntern(token, departmentId) {
  if (!departmentId) {
    logSkip('interns', 'create', 'no departmentId');
    return null;
  }
  const res = post(
    BASE,
    internPayload(departmentId),
    authHeaders(token),
    'interns-create',
  );
  if (expectStatus(res, 201, 'interns.create')) {
    expectDataField(res, 'id', 'interns.create');
    logOk('interns', 'create', res);
    return extractId(res);
  }
  logFail('interns', 'create', res);
  return null;
}

export function updateIntern(token, id, departmentId) {
  const payload = { ...internPayload(departmentId), firstName: 'Updated' };
  const res = put(`${BASE}/${id}`, payload, authHeaders(token), 'interns-update');
  if (expectStatus(res, 200, 'interns.update')) {
    logOk('interns', 'update', res);
  } else {
    logFail('interns', 'update', res, `id=${id}`);
  }
  return res;
}

export function updateInternStatus(token, id, status = 'COMPLETED') {
  const res = patch(
    `${BASE}/${id}/status?status=${status}`,
    {},
    authHeaders(token),
    'interns-status',
  );
  if (expectStatus(res, 200, 'interns.status')) {
    logOk('interns', 'status', res);
  } else {
    logFail('interns', 'status', res, `id=${id}`);
  }
  return res;
}

export function getInternDocuments(token, id) {
  const res = get(`${BASE}/${id}/documents`, authHeaders(token), 'interns-docs');
  if (expectStatus(res, 200, 'interns.documents')) {
    logOk('interns', 'documents', res);
  } else {
    logFail('interns', 'documents', res, `id=${id}`);
  }
  return res;
}

export function deleteIntern(token, id) {
  const res = del(`${BASE}/${id}`, authHeaders(token), 'interns-delete');
  if (expectStatus(res, 200, 'interns.delete')) {
    logOk('interns', 'delete', res);
    return true;
  }
  logFail('interns', 'delete', res, `id=${id}`);
  return false;
}

/** Full flow — returns intern ID. */
export function internFlow(token, departmentId) {
  listInterns(token);
  listInterns(token, null, 'ACTIVE');
  const id = createIntern(token, departmentId);
  if (id) {
    getIntern(token, id);
    getInternDocuments(token, id);
    updateIntern(token, id, departmentId);
  }
  return id;
}
