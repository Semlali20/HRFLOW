/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SOAK TEST — Extended duration to detect memory / resource leaks
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs 20 VUs for 2 hours at steady state. Look for:
 *   - Gradual p(95) latency drift (JVM heap pressure / GC pauses)
 *   - Rising error rate after 30–60 min (connection-pool exhaustion)
 *   - Spring Boot heap usage climbing without plateau (memory leak)
 *   - PostgreSQL idle connections accumulating (connection leak)
 *
 * Correlate with:
 *   - JVM heap via Actuator: GET /actuator/metrics/jvm.memory.used
 *   - HikariCP pool via Actuator: GET /actuator/metrics/hikaricp.connections
 *   - Spring Boot logs for "HikariPool … connection is not available"
 *
 * Command:
 *   k6 run k6/tests/soak.js
 *   k6 run --env BASE_URL=http://localhost:8090 k6/tests/soak.js
 *
 * Note: This test runs for ~2 hours. Use --out influxdb or --out cloud
 *       to stream results to a time-series backend for live monitoring.
 */

import { SharedArray }        from 'k6/data';
import { group }              from 'k6';
import { SOAK_OPTIONS }       from '../config/options.js';
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
import { getKpiDashboard }    from '../modules/reports.js';
import { logScenario }        from '../helpers/logger.js';
import { thinkShort,
         thinkMedium,
         thinkLong }          from '../helpers/sleep.js';

export const options = SOAK_OPTIONS;

// Shared across all VUs — loaded once in the main process
const USERS = new SharedArray('users', function () {
  return JSON.parse(open('../data/users.json'));
});

export default function () {
  const user = USERS[__VU % USERS.length];
  logScenario(`SOAK — VU${__VU} iter${__ITER} as ${user.role}`);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const token = login(user.email, user.password);
  if (!token) return;
  thinkMedium();

  // ── Dashboard simulation ────────────────────────────────────────────────────
  group('dashboard', () => {
    const deptsRes = listDepartments(token);
    thinkShort();

    // Drill into first department to simulate realistic navigation
    try {
      const body = deptsRes.json();
      const arr  = body.content || body.data || [];
      if (Array.isArray(arr) && arr.length > 0) {
        getDepartment(token, arr[0].id);
      }
    } catch (_) {}
    thinkShort();

    listPositions(token);
    thinkShort();
  });

  // ── Employee section ────────────────────────────────────────────────────────
  group('employees', () => {
    listEmployees(token);    thinkShort();
    searchEmployees(token, 'a');  thinkShort();
    listInterns(token);      thinkMedium();
  });

  // ── Leave section ───────────────────────────────────────────────────────────
  group('leaves', () => {
    listLeaveTypes(token);        thinkShort();
    listMyLeaveRequests(token);   thinkShort();
    getMyBalances(token);         thinkMedium();
  });

  // ── Planning ────────────────────────────────────────────────────────────────
  group('planning', () => {
    listPlanningEvents(token);    thinkShort();
  });

  // ── Notifications ───────────────────────────────────────────────────────────
  group('notifications', () => {
    notificationFlow(token);      thinkMedium();
  });

  // ── Reports (admin / HR only) ────────────────────────────────────────────────
  if (user.role === 'ADMIN' || user.role === 'COLLABORATEUR_RH') {
    group('reports', () => {
      getKpiDashboard(token);     thinkLong();
    });
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  logout(token);
  thinkLong(); // simulate user idle between sessions
}
