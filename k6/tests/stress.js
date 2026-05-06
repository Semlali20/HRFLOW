/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STRESS TEST — Push beyond normal capacity to find the breaking point
 * ─────────────────────────────────────────────────────────────────────────────
 * Ramps VUs aggressively. Expects some degradation — thresholds are relaxed.
 * Watch for:
 *   - p(99) latency climbing past 3 s
 *   - Error rate rising above 5%
 *   - Spring Boot thread-pool exhaustion (503 responses)
 *   - PostgreSQL connection-pool exhaustion (HikariCP timeout errors in logs)
 *
 * Command:
 *   k6 run k6/tests/stress.js
 *   k6 run --env BASE_URL=http://localhost:8090 k6/tests/stress.js
 */

import { SharedArray }       from 'k6/data';
import { STRESS_OPTIONS }    from '../config/options.js';
import { login, logout }     from '../modules/auth.js';
import { listDepartments }   from '../modules/departments.js';
import { listEmployees }     from '../modules/employees.js';
import { listLeaveTypes,
         listMyLeaveRequests } from '../modules/leaves.js';
import { listNotifications } from '../modules/notifications.js';
import { logScenario }       from '../helpers/logger.js';
import { thinkShort }        from '../helpers/sleep.js';

export const options = STRESS_OPTIONS;

const USERS = new SharedArray('users', function () {
  return JSON.parse(open('../data/users.json'));
});

export default function () {
  const user  = USERS[__VU % USERS.length];
  logScenario(`STRESS — VU${__VU}`);

  // Under stress, keep the flow simple so failures are clearly due to load,
  // not complex business logic errors.
  const token = login(user.email, user.password);
  if (!token) return;

  // Minimal but representative read path
  listDepartments(token);
  thinkShort();
  listEmployees(token);
  thinkShort();
  listLeaveTypes(token);
  thinkShort();
  listMyLeaveRequests(token);
  thinkShort();
  listNotifications(token);

  logout(token);
}
