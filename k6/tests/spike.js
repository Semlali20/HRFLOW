/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SPIKE TEST — Sudden burst of traffic (flash-crowd simulation)
 * ─────────────────────────────────────────────────────────────────────────────
 * Ramps from 5 → 200 VUs in 30 seconds, holds for 1 minute, then drops back.
 * This simulates real-world events like:
 *   - All employees rushing to submit leave requests on Monday morning
 *   - A mass notification causing everyone to open the app simultaneously
 *   - A scheduled payroll run that triggers dashboard refreshes company-wide
 *
 * Watch for:
 *   - HTTP 503 / 429 from Spring Boot thread exhaustion or rate-limiting
 *   - p(99) latency spikes above 5 s during the burst
 *   - Error rate > 10% (thresholds are intentionally relaxed for this profile)
 *   - JVM GC pauses ("stop-the-world" visible as flatlines in latency graphs)
 *   - Whether the system recovers cleanly once load drops back to baseline
 *
 * Command:
 *   k6 run k6/tests/spike.js
 *   k6 run --env BASE_URL=http://localhost:8090 k6/tests/spike.js
 */

import { SharedArray }          from 'k6/data';
import { SPIKE_OPTIONS }        from '../config/options.js';
import { login, logout }        from '../modules/auth.js';
import { listDepartments }      from '../modules/departments.js';
import { listEmployees }        from '../modules/employees.js';
import { listLeaveTypes,
         listMyLeaveRequests,
         getMyBalances,
         submitLeaveRequest }   from '../modules/leaves.js';
import { listNotifications }    from '../modules/notifications.js';
import { logScenario }          from '../helpers/logger.js';
import { thinkShort }           from '../helpers/sleep.js';

export const options = SPIKE_OPTIONS;

const USERS = new SharedArray('users', function () {
  return JSON.parse(open('../data/users.json'));
});

const ADMIN_EMAIL    = __ENV.ADMIN_EMAIL    || 'houarimehdi7@gmail.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || '39EAFC8e6e@Rh464';

export default function () {
  const user = USERS[__VU % USERS.length];
  logScenario(`SPIKE — VU${__VU}`);

  // During a spike, keep the flow tight so each VU puts maximum concurrent
  // pressure on the most-hit paths with minimal sleep between requests.

  // ── Auth (high-contention during spike) ────────────────────────────────────
  const token = login(user.email, user.password);
  if (!token) return;

  // ── Read burst — simulates everyone opening the dashboard at once ───────────
  listDepartments(token);
  listEmployees(token);
  listLeaveTypes(token);
  listMyLeaveRequests(token);
  getMyBalances(token);
  listNotifications(token);
  thinkShort(); // minimal pause — we WANT the pressure

  // ── Write burst — simulates leave-request rush ──────────────────────────────
  // Only attempt submit for non-admin users (mirrors real usage)
  if (user.role !== 'ADMIN') {
    try {
      const res = listLeaveTypes(token);
      const body = res.json();
      const arr  = body.data || body.content || body;
      if (Array.isArray(arr) && arr.length > 0) {
        submitLeaveRequest(token, arr[0].id);
      }
    } catch (_) {}
  }

  thinkShort();
  logout(token);
}
