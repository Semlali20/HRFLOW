/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Departments Module
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, authHeaders }              from '../config/constants.js';
import { get, post, put, del }           from '../helpers/http.js';
import { expectStatus, expectDataArray,
         expectDataField, expectJsonField,
         extractId }                     from '../helpers/checks.js';
import { logOk, logFail }               from '../helpers/logger.js';
import { departmentPayload }             from '../data/payloads.js';

const BASE = `${API}/departments`;

/** List all departments (paginated). Returns response. */
export function listDepartments(token) {
  const res = get(BASE, authHeaders(token), 'departments-list');

  if (expectStatus(res, 200, 'departments.list')) {
    expectDataArray(res, 'departments.list');
    logOk('departments', 'list', res);
  } else {
    logFail('departments', 'list', res);
  }

  return res;
}

/** List only active departments. */
export function listActiveDepartments(token) {
  const res = get(`${BASE}/active`, authHeaders(token), 'departments-active');

  if (expectStatus(res, 200, 'departments.active')) {
    logOk('departments', 'active', res);
  } else {
    logFail('departments', 'active', res);
  }

  return res;
}

/** Get department by ID. */
export function getDepartment(token, id) {
  const res = get(`${BASE}/${id}`, authHeaders(token), 'departments-get');

  if (expectStatus(res, 200, 'departments.get')) {
    expectJsonField(res, 'id', 'departments.get');
    logOk('departments', 'get', res);
  } else {
    logFail('departments', 'get', res, `id=${id}`);
  }

  return res;
}

/**
 * Create a department.
 * Returns the new department ID, or null on failure.
 */
export function createDepartment(token) {
  const res = post(BASE, departmentPayload(), authHeaders(token), 'departments-create');

  if (expectStatus(res, 201, 'departments.create')) {
    expectJsonField(res, 'id', 'departments.create');
    logOk('departments', 'create', res);
    return extractId(res);
  }

  logFail('departments', 'create', res);
  return null;
}

/** Update a department. Returns response. */
export function updateDepartment(token, id) {
  const payload = { ...departmentPayload(), name: `Updated Dept ${id}` };
  const res = put(`${BASE}/${id}`, payload, authHeaders(token), 'departments-update');

  if (expectStatus(res, 200, 'departments.update')) {
    logOk('departments', 'update', res);
  } else {
    logFail('departments', 'update', res, `id=${id}`);
  }

  return res;
}

/** Delete a department. Returns true on success. */
export function deleteDepartment(token, id) {
  const res = del(`${BASE}/${id}`, authHeaders(token), 'departments-delete');

  if (expectStatus(res, 200, 'departments.delete')) {
    logOk('departments', 'delete', res);
    return true;
  }

  logFail('departments', 'delete', res, `id=${id}`);
  return false;
}

/**
 * Full CRUD flow — used in main.js user journey.
 * Returns the created department ID for downstream use.
 */
export function departmentFlow(token) {
  listDepartments(token);
  listActiveDepartments(token);
  const id = createDepartment(token);
  if (id) {
    getDepartment(token, id);
    updateDepartment(token, id);
    // Don't delete — positions/employees may need it downstream
  }
  return id;
}
