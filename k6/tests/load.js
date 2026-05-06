/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LOAD TEST — Simulates normal production traffic
 * ─────────────────────────────────────────────────────────────────────────────
 * Stages:
 *   0–1 min   → ramp to 10 VUs
 *   1–4 min   → steady 10 VUs
 *   4–5 min   → ramp to 25 VUs
 *   5–8 min   → steady 25 VUs
 *   8–9 min   → ramp down
 *
 * Each VU picks a random user from users.json, logs in, runs the full
 * read-heavy user journey, then logs out and repeats.
 *
 * Command:
 *   k6 run k6/tests/load.js
 *   k6 run --env BASE_URL=https://api.staging.example.com k6/tests/load.js
 */

import { SharedArray }        from 'k6/data';
import { LOAD_OPTIONS }       from '../config/options.js';
import { login, logout }      from '../modules/auth.js';
import { listDepartments,
         getDepartment }      from '../modules/departments.js';
import { listPositions }      from '../modules/positions.js';
import { listEmployees,
         searchEmployees }    from '../modules/employees.js';
import { listInterns }        from '../modules/interns.js';
import { listLeaveTypes,
         listMyLeaveRequests,
         getMyBalances }      from '../modules/leaves.js';
import { listPlanningEvents } from '../modules/planning.js';
import { notificationFlow }   from '../modules/notifications.js';
import { reportsFlow }        from '../modules/reports.js';
import { logScenario }        from '../helpers/logger.js';
import { thinkShort,
         thinkMedium,
         thinkLong }          from '../helpers/sleep.js';

export const options = LOAD_OPTIONS;

// Load users once and share across all VUs (avoids re-parsing per iteration)
const USERS = new SharedArray('users', function () {
  return JSON.parse(open('../data/users.json'));
});

export default function () {
  // Each VU picks a user deterministically (round-robin) so all accounts are used
  const user  = USERS[__VU % USERS.length];
  logScenario(`LOAD — VU${__VU} as ${user.role}`);

  // ── 1. Login ───────────────────────────────────────────────────────────────
  const token = login(user.email, user.password);
  if (!token) return;
  thinkMedium();

  // ── 2. Dashboard simulation — multiple read requests ───────────────────────
  const deptsRes = listDepartments(token);
  thinkShort();

  // Try to read first dept detail (simulates clicking into a record)
  try {
    const depts = deptsRes.json();
    const arr   = depts.content || depts.data || [];
    if (Array.isArray(arr) && arr.length > 0) {
      getDepartment(token, arr[0].id);
    }
  } catch (_) {}
  thinkShort();

  listPositions(token);         thinkShort();
  listEmployees(token);         thinkShort();
  searchEmployees(token, 'a');  thinkShort(); // realistic partial search
  listInterns(token);           thinkMedium();

  // ── 3. Leave section ───────────────────────────────────────────────────────
  listLeaveTypes(token);        thinkShort();
  listMyLeaveRequests(token);   thinkShort();
  getMyBalances(token);         thinkMedium();

  // ── 4. Planning ────────────────────────────────────────────────────────────
  listPlanningEvents(token);    thinkShort();

  // ── 5. Notifications ───────────────────────────────────────────────────────
  notificationFlow(token);      thinkMedium();

  // ── 6. Reports (admin/HR roles only) ──────────────────────────────────────
  // REPORT_EXPORT is now granted to both ADMIN and COLLABORATEUR_RH
  if (user.role === 'ADMIN' || user.role === 'COLLABORATEUR_RH') {
    reportsFlow(token, /* canExport= */ true);
    thinkLong();
  }

  // ── 7. Logout ──────────────────────────────────────────────────────────────
  logout(token);
  thinkLong(); // simulate user closing the app before next iteration
}
