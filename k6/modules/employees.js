/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Employees Module
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, authHeaders }           from '../config/constants.js';
import { get, post, put, patch, del } from '../helpers/http.js';
import { expectStatus, expectDataField,
         expectDataArray, extractId } from '../helpers/checks.js';
import { logOk, logFail, logSkip }   from '../helpers/logger.js';
import { employeePayload }            from '../data/payloads.js';

const BASE = `${API}/employees`;

export function listEmployees(token, search = null) {
  const url = search ? `${BASE}?search=${encodeURIComponent(search)}` : BASE;
  const res = get(url, authHeaders(token), 'employees-list');
  if (expectStatus(res, 200, 'employees.list')) {
    logOk('employees', 'list', res);
  } else {
    logFail('employees', 'list', res);
  }
  return res;
}

export function listEmployeesByDepartment(token, departmentId) {
  const res = get(
    `${BASE}/department/${departmentId}`,
    authHeaders(token),
    'employees-by-dept',
  );
  if (expectStatus(res, 200, 'employees.byDept')) {
    logOk('employees', 'byDept', res);
  } else {
    logFail('employees', 'byDept', res, `deptId=${departmentId}`);
  }
  return res;
}

export function getEmployee(token, id) {
  const res = get(`${BASE}/${id}`, authHeaders(token), 'employees-get');
  if (expectStatus(res, 200, 'employees.get')) {
    expectDataField(res, 'id', 'employees.get');
    logOk('employees', 'get', res);
  } else {
    logFail('employees', 'get', res, `id=${id}`);
  }
  return res;
}

/** Returns new employee ID or null. */
export function createEmployee(token, departmentId, positionId) {
  if (!departmentId || !positionId) {
    logSkip('employees', 'create', 'missing departmentId or positionId');
    return null;
  }
  const res = post(
    BASE,
    employeePayload(departmentId, positionId),
    authHeaders(token),
    'employees-create',
  );
  if (expectStatus(res, 201, 'employees.create')) {
    expectDataField(res, 'id', 'employees.create');
    logOk('employees', 'create', res);
    return extractId(res);
  }
  logFail('employees', 'create', res);
  return null;
}

export function updateEmployee(token, id, departmentId, positionId) {
  const payload = {
    ...employeePayload(departmentId, positionId),
    firstName: 'Updated',
    lastName: `Employee${id}`,
  };
  const res = put(`${BASE}/${id}`, payload, authHeaders(token), 'employees-update');
  if (expectStatus(res, 200, 'employees.update')) {
    logOk('employees', 'update', res);
  } else {
    logFail('employees', 'update', res, `id=${id}`);
  }
  return res;
}

export function updateEmployeeStatus(token, id, status = 'ACTIVE') {
  const res = patch(
    `${BASE}/${id}/status?status=${status}`,
    {},
    authHeaders(token),
    'employees-status',
  );
  if (expectStatus(res, 200, 'employees.status')) {
    logOk('employees', 'status', res);
  } else {
    logFail('employees', 'status', res, `id=${id} status=${status}`);
  }
  return res;
}

/** Soft-delete (deactivate) an employee. */
export function deleteEmployee(token, id) {
  const res = del(`${BASE}/${id}`, authHeaders(token), 'employees-delete');
  if (expectStatus(res, 200, 'employees.delete')) {
    logOk('employees', 'delete', res);
    return true;
  }
  logFail('employees', 'delete', res, `id=${id}`);
  return false;
}

/** Search employees by name/email. */
export function searchEmployees(token, query) {
  const res = get(
    `${BASE}?search=${encodeURIComponent(query)}`,
    authHeaders(token),
    'employees-search',
  );
  if (expectStatus(res, 200, 'employees.search')) {
    logOk('employees', 'search', res);
  } else {
    logFail('employees', 'search', res, `query=${query}`);
  }
  return res;
}

/** Full CRUD flow — returns created employee ID. */
export function employeeFlow(token, departmentId, positionId) {
  listEmployees(token);
  searchEmployees(token, 'Test');
  if (departmentId) listEmployeesByDepartment(token, departmentId);
  const id = createEmployee(token, departmentId, positionId);
  if (id) {
    getEmployee(token, id);
    updateEmployee(token, id, departmentId, positionId);
    updateEmployeeStatus(token, id, 'ACTIVE');
  }
  return id;
}
