/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Reports Module
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, authHeaders } from '../config/constants.js';
import { get }              from '../helpers/http.js';
import { expectStatus,
         expectBody }       from '../helpers/checks.js';
import { logOk, logFail }  from '../helpers/logger.js';

const BASE = `${API}/reports`;

export function getKpiDashboard(token) {
  const res = get(`${BASE}/kpi`, authHeaders(token), 'reports-kpi');
  if (expectStatus(res, 200, 'reports.kpi')) {
    expectBody(res, 'reports.kpi');
    logOk('reports', 'kpi', res);
  } else {
    logFail('reports', 'kpi', res);
  }
  return res;
}

export function exportEmployeesExcel(token) {
  const res = get(`${BASE}/employees/excel`, authHeaders(token), 'reports-emp-excel');
  if (expectStatus(res, 200, 'reports.employees.excel')) {
    logOk('reports', 'employees.excel', res);
  } else {
    logFail('reports', 'employees.excel', res);
  }
  return res;
}

export function exportInternsExcel(token) {
  const res = get(`${BASE}/interns/excel`, authHeaders(token), 'reports-interns-excel');
  if (expectStatus(res, 200, 'reports.interns.excel')) {
    logOk('reports', 'interns.excel', res);
  } else {
    logFail('reports', 'interns.excel', res);
  }
  return res;
}

export function exportEmployeesPdf(token) {
  const res = get(`${BASE}/employees/pdf`, authHeaders(token), 'reports-emp-pdf');
  if (expectStatus(res, 200, 'reports.employees.pdf')) {
    logOk('reports', 'employees.pdf', res);
  } else {
    logFail('reports', 'employees.pdf', res);
  }
  return res;
}

/**
 * Full reports flow.
 * @param {string} token       - JWT access token
 * @param {boolean} canExport  - pass true only for roles with REPORT_EXPORT
 *                               (ADMIN, and roles explicitly granted REPORT_EXPORT).
 *                               Defaults to true for backward compatibility.
 */
export function reportsFlow(token, canExport = true) {
  getKpiDashboard(token);
  if (canExport) {
    exportEmployeesExcel(token);
    exportInternsExcel(token);
    exportEmployeesPdf(token);
  }
}
