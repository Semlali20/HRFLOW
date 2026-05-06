/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Positions Module
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, authHeaders }           from '../config/constants.js';
import { get, post, put, del }        from '../helpers/http.js';
import { expectStatus, expectDataField, expectJsonField,
         expectDataArray, extractId } from '../helpers/checks.js';
import { logOk, logFail, logSkip }   from '../helpers/logger.js';
import { positionPayload }            from '../data/payloads.js';

const BASE = `${API}/positions`;

export function listPositions(token) {
  const res = get(BASE, authHeaders(token), 'positions-list');
  if (expectStatus(res, 200, 'positions.list')) {
    logOk('positions', 'list', res);
  } else {
    logFail('positions', 'list', res);
  }
  return res;
}

export function listPositionsByDepartment(token, departmentId) {
  const res = get(
    `${BASE}/department/${departmentId}`,
    authHeaders(token),
    'positions-by-dept',
  );
  if (expectStatus(res, 200, 'positions.byDept')) {
    logOk('positions', 'byDept', res);
  } else {
    logFail('positions', 'byDept', res, `deptId=${departmentId}`);
  }
  return res;
}

export function getPosition(token, id) {
  const res = get(`${BASE}/${id}`, authHeaders(token), 'positions-get');
  if (expectStatus(res, 200, 'positions.get')) {
    expectJsonField(res, 'id', 'positions.get');
    logOk('positions', 'get', res);
  } else {
    logFail('positions', 'get', res, `id=${id}`);
  }
  return res;
}

/** Returns new position ID or null. */
export function createPosition(token, departmentId) {
  if (!departmentId) {
    logSkip('positions', 'create', 'no departmentId');
    return null;
  }
  const res = post(
    BASE,
    positionPayload(departmentId),
    authHeaders(token),
    'positions-create',
  );
  if (expectStatus(res, 201, 'positions.create')) {
    expectJsonField(res, 'id', 'positions.create');
    logOk('positions', 'create', res);
    return extractId(res);
  }
  logFail('positions', 'create', res);
  return null;
}

export function updatePosition(token, id, departmentId) {
  const payload = { ...positionPayload(departmentId), title: `Updated Position ${id}` };
  const res = put(`${BASE}/${id}`, payload, authHeaders(token), 'positions-update');
  if (expectStatus(res, 200, 'positions.update')) {
    logOk('positions', 'update', res);
  } else {
    logFail('positions', 'update', res, `id=${id}`);
  }
  return res;
}

export function deletePosition(token, id) {
  const res = del(`${BASE}/${id}`, authHeaders(token), 'positions-delete');
  if (expectStatus(res, 200, 'positions.delete')) {
    logOk('positions', 'delete', res);
    return true;
  }
  logFail('positions', 'delete', res, `id=${id}`);
  return false;
}

/** Full CRUD flow — returns created position ID. */
export function positionFlow(token, departmentId) {
  listPositions(token);
  if (departmentId) listPositionsByDepartment(token, departmentId);
  const id = createPosition(token, departmentId);
  if (id) {
    getPosition(token, id);
    updatePosition(token, id, departmentId);
  }
  return id;
}
