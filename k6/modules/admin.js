/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Module — Users, Roles, Audit Logs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, authHeaders }  from '../config/constants.js';
import { get, put, del }     from '../helpers/http.js';
import { expectStatus,
         expectDataArray,
         expectDataField }   from '../helpers/checks.js';
import { logOk, logFail }   from '../helpers/logger.js';

const USERS_BASE = `${API}/admin/users`;
const ROLES_BASE = `${API}/admin/roles`;
const AUDIT_BASE = `${API}/audit`;

// ── Users ──────────────────────────────────────────────────────────────────────

export function listUsers(token, search = null) {
  const url = search
    ? `${USERS_BASE}?search=${encodeURIComponent(search)}`
    : USERS_BASE;
  const res = get(url, authHeaders(token), 'admin-users-list');
  if (expectStatus(res, 200, 'admin.users.list')) {
    logOk('admin', 'users.list', res);
  } else {
    logFail('admin', 'users.list', res);
  }
  return res;
}

export function getUser(token, id) {
  const res = get(`${USERS_BASE}/${id}`, authHeaders(token), 'admin-users-get');
  if (expectStatus(res, 200, 'admin.users.get')) {
    expectDataField(res, 'id', 'admin.users.get');
    logOk('admin', 'users.get', res);
  } else {
    logFail('admin', 'users.get', res, `id=${id}`);
  }
  return res;
}

export function deleteUser(token, id) {
  const res = del(`${USERS_BASE}/${id}`, authHeaders(token), 'admin-users-delete');
  if (expectStatus(res, 200, 'admin.users.delete')) {
    logOk('admin', 'users.delete', res);
    return true;
  }
  logFail('admin', 'users.delete', res, `id=${id}`);
  return false;
}

// ── Roles ──────────────────────────────────────────────────────────────────────

export function listRoles(token) {
  const res = get(ROLES_BASE, authHeaders(token), 'admin-roles-list');
  if (expectStatus(res, 200, 'admin.roles.list')) {
    logOk('admin', 'roles.list', res);
  } else {
    logFail('admin', 'roles.list', res);
  }
  return res;
}

export function listPermissions(token) {
  const res = get(`${ROLES_BASE}/permissions`, authHeaders(token), 'admin-perms-list');
  if (expectStatus(res, 200, 'admin.permissions.list')) {
    logOk('admin', 'permissions.list', res);
  } else {
    logFail('admin', 'permissions.list', res);
  }
  return res;
}

// ── Audit Logs ─────────────────────────────────────────────────────────────────

export function listAuditLogs(token) {
  const res = get(AUDIT_BASE, authHeaders(token), 'audit-list');
  if (expectStatus(res, 200, 'audit.list')) {
    logOk('audit', 'list', res);
  } else {
    logFail('audit', 'list', res);
  }
  return res;
}

export function getAuditByModule(token, module) {
  const res = get(`${AUDIT_BASE}/module/${module}`, authHeaders(token), 'audit-by-module');
  if (expectStatus(res, 200, 'audit.byModule')) {
    logOk('audit', 'byModule', res);
  } else {
    logFail('audit', 'byModule', res, `module=${module}`);
  }
  return res;
}

export function getAuditByDateRange(token) {
  const from = encodeURIComponent('2025-01-01T00:00:00');
  const to   = encodeURIComponent('2025-12-31T23:59:59');
  const res  = get(`${AUDIT_BASE}/range?from=${from}&to=${to}`, authHeaders(token), 'audit-range');
  if (expectStatus(res, 200, 'audit.range')) {
    logOk('audit', 'range', res);
  } else {
    logFail('audit', 'range', res);
  }
  return res;
}

/** Full admin read-only flow. */
export function adminFlow(token) {
  listUsers(token);
  listRoles(token);
  listPermissions(token);
  listAuditLogs(token);
  getAuditByModule(token, 'EMPLOYEE');
  getAuditByDateRange(token);
}
