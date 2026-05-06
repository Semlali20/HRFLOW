/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SMOKE TEST — 1 VU, 30 s
 * ─────────────────────────────────────────────────────────────────────────────
 * Purpose: verify the API is alive and all critical endpoints return 200/201.
 * Run before every deployment.
 *
 * Command:
 *   k6 run k6/tests/smoke.js
 *   k6 run --env BASE_URL=http://staging:8090 k6/tests/smoke.js
 */

import { SMOKE_OPTIONS }      from '../config/options.js';
import { login, logout }      from '../modules/auth.js';
import { listDepartments }    from '../modules/departments.js';
import { listEmployees }      from '../modules/employees.js';
import { listLeaveTypes,
         listMyLeaveRequests,
         getMyBalances }      from '../modules/leaves.js';
import { listNotifications,
         getUnreadCount }     from '../modules/notifications.js';
import { getKpiDashboard }    from '../modules/reports.js';
import { logScenario }        from '../helpers/logger.js';
import { thinkShort }         from '../helpers/sleep.js';

export const options = SMOKE_OPTIONS;

// Credentials come from --env or fall back to local defaults
const EMAIL    = __ENV.ADMIN_EMAIL    || 'houarimehdi7@gmail.com';
const PASSWORD = __ENV.ADMIN_PASSWORD || '39EAFC8e6e@Rh464';

export default function () {
  logScenario('SMOKE');

  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const token = login(EMAIL, PASSWORD);
  if (!token) return; // abort this iteration — no point continuing
  thinkShort();

  // ── 2. Read-only sweep of critical endpoints ───────────────────────────────
  listDepartments(token);       thinkShort();
  listEmployees(token);         thinkShort();
  listLeaveTypes(token);        thinkShort();
  listMyLeaveRequests(token);   thinkShort();
  getMyBalances(token);         thinkShort();
  listNotifications(token);     thinkShort();
  getUnreadCount(token);        thinkShort();
  getKpiDashboard(token);       thinkShort();

  // ── 3. Logout ──────────────────────────────────────────────────────────────
  logout(token);
}
