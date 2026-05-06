/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Payload Factories — Generate realistic test payloads
 * ─────────────────────────────────────────────────────────────────────────────
 * Using factory functions (instead of static objects) ensures each VU gets
 * unique data, preventing unique-constraint conflicts in the database.
 */

// Unique suffix per VU + timestamp to avoid DB conflicts
function uid() {
  return `${__VU}_${Date.now()}`;
}

// ── Auth ───────────────────────────────────────────────────────────────────────
export function loginPayload(email, password) {
  return { email, password };
}

// ── Department ────────────────────────────────────────────────────────────────
export function departmentPayload() {
  return {
    name: `Test Department ${uid()}`,
    code: `DEPT-${uid()}`,
    description: 'Created by k6 load test',
    active: true,
  };
}

// ── Position ──────────────────────────────────────────────────────────────────
export function positionPayload(departmentId) {
  return {
    title: `Test Position ${uid()}`,
    code: `POS-${uid()}`,
    description: 'Load test position',
    departmentId,
    active: true,
  };
}

// ── Employee ──────────────────────────────────────────────────────────────────
export function employeePayload(departmentId, positionId) {
  const id = uid();
  return {
    firstName: 'LoadTest',
    lastName: `User${id}`,
    email: `loadtest.${id}@innovx-test.com`,
    cin: `AB${id.replace('_', '').substring(0, 6)}`,
    phone: '+212600000001',
    dateOfBirth: '1990-05-15',
    hireDate: '2023-01-01',
    gender: 'MALE',
    departmentId,
    positionId,
    status: 'ACTIVE',
  };
}

// ── Intern ────────────────────────────────────────────────────────────────────
export function internPayload(departmentId) {
  const id = uid();
  return {
    firstName: 'Intern',
    lastName: `Test${id}`,
    email: `intern.${id}@school.com`,
    phone: '+212600000002',
    school: 'ENSIAS',
    specialty: 'Software Engineering',
    departmentId,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    status: 'ACTIVE',
  };
}

// ── Leave Type ────────────────────────────────────────────────────────────────
export function leaveTypePayload() {
  return {
    name: `Leave Type ${uid()}`,
    code: `LT-${uid()}`,
    description: 'k6 test leave type',
    maxDaysPerYear: 21,
    requiresApproval: true,
    active: true,
  };
}

// ── Leave Request ─────────────────────────────────────────────────────────────
export function leaveRequestPayload(leaveTypeId) {
  return {
    leaveTypeId,
    startDate: '2025-08-01',
    endDate: '2025-08-05',
    reason: 'k6 load test leave request',
  };
}

// ── Leave Decision ────────────────────────────────────────────────────────────
export function leaveApprovePayload() {
  return { comment: 'Approved by k6 load test' };
}

export function leaveRejectPayload() {
  return { comment: 'Rejected by k6 load test' };
}

// ── Stage Offer ───────────────────────────────────────────────────────────────
export function stageOfferPayload(departmentId) {
  return {
    title: `Internship Offer ${uid()}`,
    description: 'k6 load test offer',
    departmentId,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'OPEN',
  };
}

// ── Planning Event ────────────────────────────────────────────────────────────
export function planningEventPayload() {
  return {
    title: `Meeting ${uid()}`,
    description: 'k6 test planning event',
    startDateTime: '2025-07-15T09:00:00',
    endDateTime: '2025-07-15T10:00:00',
    location: 'Conference Room A',
    type: 'MEETING',
  };
}

// ── Meeting ───────────────────────────────────────────────────────────────────
export function meetingPayload(internId) {
  return {
    internId,
    title: `Follow-up ${uid()}`,
    scheduledDate: '2025-07-20T10:00:00',
    notes: 'k6 load test meeting',
    type: 'FOLLOW_UP',
  };
}

// ── Public Holiday ────────────────────────────────────────────────────────────
export function publicHolidayPayload() {
  return {
    name: `Holiday ${uid()}`,
    date: '2025-12-25',
    countryCode: 'MA',
    recurring: true,
  };
}
