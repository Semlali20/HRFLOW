/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * HRFLOW k6 — Main Full-Journey Test
 * ═══════════════════════════════════════════════════════════════════════════════
 * Simulates a complete, realistic HR workflow:
 *
 *   Admin:  login → create dept → create position → create employee
 *           → create intern → manage leave → check reports → logout
 *   HR:     login → browse employees → submit leave → check notifications → logout
 *
 * Run (load profile):
 *   k6 run k6/main.js
 *
 * Run (custom base URL + env):
 *   k6 run --env BASE_URL=http://staging:8090 \
 *          --env LOG_LEVEL=debug             \
 *          k6/main.js
 *
 * Run (specific profile override):
 *   k6 run --stage 2m:5,5m:5,1m:0 k6/main.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { SharedArray }          from 'k6/data';
import { group }                from 'k6';

// Config
import { LOAD_OPTIONS }         from './config/options.js';

// Modules
import { login, logout }        from './modules/auth.js';
import { departmentFlow,
         createDepartment,
         listDepartments }      from './modules/departments.js';
import { positionFlow,
         createPosition }       from './modules/positions.js';
import { employeeFlow,
         createEmployee }       from './modules/employees.js';
import { internFlow }           from './modules/interns.js';
import { leaveLifecycleFlow,
         listLeaveTypes,
         listMyLeaveRequests,
         getMyBalances,
         submitLeaveRequest }   from './modules/leaves.js';
import { planningFlow,
         listPlanningEvents }   from './modules/planning.js';
import { notificationFlow }     from './modules/notifications.js';
import { adminFlow }            from './modules/admin.js';
import { reportsFlow }          from './modules/reports.js';

// Helpers
import { logScenario, logSkip } from './helpers/logger.js';
import { thinkShort,
         thinkMedium,
         thinkLong }            from './helpers/sleep.js';

// ── Load test options ──────────────────────────────────────────────────────────
export const options = LOAD_OPTIONS;

// ── Test data ──────────────────────────────────────────────────────────────────
// SharedArray is loaded once in the main process and shared across all VUs
const USERS = new SharedArray('users', function () {
  return JSON.parse(open('./data/users.json'));
});

// ── Per-environment credentials (can also come from users.json) ────────────────
const ADMIN_EMAIL    = __ENV.ADMIN_EMAIL    || 'admin@innovx.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@12345';

// ── setup() — runs ONCE before all VUs start ───────────────────────────────────
// Use this to seed any data that all VUs need (e.g. a shared department ID).
export function setup() {
  console.log('=== k6 HRFLOW Suite — Setup ===');
  const token = login(ADMIN_EMAIL, ADMIN_PASSWORD);
  if (!token) throw new Error('Setup: admin login failed');

  // Create a base department that all VUs can reference
  const sharedDeptId = createDepartment(token);
  let   sharedPosId  = null;

  if (sharedDeptId) {
    sharedPosId = createPosition(token, sharedDeptId);
  }

  logout(token);

  console.log(`Setup complete — sharedDeptId=${sharedDeptId}, sharedPosId=${sharedPosId}`);
  return { sharedDeptId, sharedPosId };
}

// ── Default function — runs for each VU on every iteration ────────────────────
export default function (data) {
  // Each VU picks a user in round-robin so all roles are exercised
  const user  = USERS[__VU % USERS.length];
  const isAdmin = user.role === 'ADMIN';
  const isHR    = user.role === 'COLLABORATEUR_RH' || user.role === 'STAGIAIRE_RH';
  const isManager = user.role === 'MANAGER';

  logScenario(`MAIN — VU${__VU} iter${__ITER} as ${user.role}`);

  // ── PHASE 1: Authentication ────────────────────────────────────────────────
  let token;
  group('01_auth', () => {
    token = login(user.email, user.password);
    thinkMedium();
  });

  if (!token) {
    logSkip('main', 'all', `login failed for ${user.email}`);
    return;
  }

  // ── PHASE 2: Read dashboard data ───────────────────────────────────────────
  group('02_dashboard', () => {
    listDepartments(token);
    thinkShort();
    listPlanningEvents(token);
    thinkShort();
    notificationFlow(token);
    thinkMedium();
  });

  // ── PHASE 3: Org structure (Admin/HR only) ─────────────────────────────────
  if (isAdmin || isHR) {
    group('03_org_structure', () => {
      // Departments
      departmentFlow(token);
      thinkMedium();

      // Positions under the shared department
      if (data.sharedDeptId) {
        positionFlow(token, data.sharedDeptId);
      }
      thinkMedium();
    });
  }

  // ── PHASE 4: Employee management (Admin/HR only) ───────────────────────────
  let newEmployeeId = null;
  if ((isAdmin || isHR) && data.sharedDeptId && data.sharedPosId) {
    group('04_employee_management', () => {
      newEmployeeId = employeeFlow(token, data.sharedDeptId, data.sharedPosId);
      thinkMedium();
    });
  }

  // ── PHASE 5: Intern management (Admin/STAGIAIRE_RH) ───────────────────────
  if (isAdmin || user.role === 'STAGIAIRE_RH') {
    group('05_intern_management', () => {
      internFlow(token, data.sharedDeptId);
      thinkMedium();
    });
  }

  // ── PHASE 6: Leave management ──────────────────────────────────────────────
  group('06_leave_management', () => {
    // All users can browse and submit
    listLeaveTypes(token);
    thinkShort();
    listMyLeaveRequests(token);
    thinkShort();
    getMyBalances(token);
    thinkShort();

    // HR/Admin run the full approve lifecycle.
    // Use the same token for both roles — HR and Admin have LEAVE_APPROVE,
    // eliminating the concurrent admin-login race condition on RefreshToken.
    if (isHR || isAdmin) {
      leaveLifecycleFlow(token, token);
    } else {
      // Regular employees just submit (pending, no approval in this VU)
      const typesRes = listLeaveTypes(token);
      try {
        const body = typesRes.json();
        const arr  = body.data || body.content || body;
        if (Array.isArray(arr) && arr.length > 0) {
          submitLeaveRequest(token, arr[0].id);
        }
      } catch (_) {}
    }
    thinkLong();
  });

  // ── PHASE 7: Planning ──────────────────────────────────────────────────────
  if (isAdmin || isHR) {
    group('07_planning', () => {
      planningFlow(token);
      thinkMedium();
    });
  }

  // ── PHASE 8: Reports (Admin/HR) ────────────────────────────────────────────
  // REPORT_EXPORT is granted to ADMIN, COLLABORATEUR_RH, STAGIAIRE_RH, MANAGER
  // (all roles that enter this block), so canExport = true for all of them.
  if (isAdmin || isHR) {
    group('08_reports', () => {
      reportsFlow(token, /* canExport= */ true);
      thinkLong();
    });
  }

  // ── PHASE 9: Admin operations ──────────────────────────────────────────────
  if (isAdmin) {
    group('09_admin', () => {
      adminFlow(token);
      thinkMedium();
    });
  }

  // ── PHASE 10: Logout ───────────────────────────────────────────────────────
  group('10_logout', () => {
    logout(token);
    thinkLong();
  });
}

// ── teardown() — runs ONCE after all VUs finish ────────────────────────────────
export function teardown(data) {
  console.log('=== k6 HRFLOW Suite — Teardown ===');
  // Optionally clean up seeded data here
  // For now just log what was created
  console.log(`Shared dept used: ${data.sharedDeptId}`);
  console.log(`Shared position used: ${data.sharedPosId}`);
}
