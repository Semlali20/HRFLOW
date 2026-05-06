/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Leaves Module — Leave types, requests, balances, lifecycle
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API, authHeaders }           from '../config/constants.js';
import { get, post, put, patch, del } from '../helpers/http.js';
import { expectStatus, expectDataField, expectJsonField,
         expectDataArray, extractId,
         extractData }                from '../helpers/checks.js';
import { logOk, logFail, logSkip }   from '../helpers/logger.js';
import { leaveTypePayload, leaveRequestPayload,
         leaveApprovePayload, leaveRejectPayload } from '../data/payloads.js';

const BASE = `${API}/leaves`;

// ── Leave Types ────────────────────────────────────────────────────────────────

export function listLeaveTypes(token) {
  const res = get(`${BASE}/types`, authHeaders(token), 'leave-types-list');
  if (expectStatus(res, 200, 'leaves.types.list')) {
    logOk('leaves', 'types.list', res);
  } else {
    logFail('leaves', 'types.list', res);
  }
  return res;
}

/** Returns new leave type ID or null. */
export function createLeaveType(token) {
  const res = post(
    `${BASE}/types`,
    leaveTypePayload(),
    authHeaders(token),
    'leave-types-create',
  );
  if (expectStatus(res, 201, 'leaves.types.create')) {
    expectJsonField(res, 'id', 'leaves.types.create');
    logOk('leaves', 'types.create', res);
    return extractId(res);
  }
  logFail('leaves', 'types.create', res);
  return null;
}

export function updateLeaveType(token, id) {
  const payload = { ...leaveTypePayload(), name: `Updated Leave Type ${id}` };
  const res = put(`${BASE}/types/${id}`, payload, authHeaders(token), 'leave-types-update');
  if (expectStatus(res, 200, 'leaves.types.update')) {
    logOk('leaves', 'types.update', res);
  } else {
    logFail('leaves', 'types.update', res, `id=${id}`);
  }
  return res;
}

export function deleteLeaveType(token, id) {
  const res = del(`${BASE}/types/${id}`, authHeaders(token), 'leave-types-delete');
  if (expectStatus(res, 200, 'leaves.types.delete')) {
    logOk('leaves', 'types.delete', res);
    return true;
  }
  logFail('leaves', 'types.delete', res, `id=${id}`);
  return false;
}

// ── Leave Requests ─────────────────────────────────────────────────────────────

export function listAllLeaveRequests(token) {
  const res = get(BASE, authHeaders(token), 'leave-list-all');
  if (expectStatus(res, 200, 'leaves.listAll')) {
    logOk('leaves', 'listAll', res);
  } else {
    logFail('leaves', 'listAll', res);
  }
  return res;
}

export function listMyLeaveRequests(token) {
  const res = get(`${BASE}/my`, authHeaders(token), 'leave-list-my');
  if (expectStatus(res, 200, 'leaves.listMy')) {
    logOk('leaves', 'listMy', res);
  } else {
    logFail('leaves', 'listMy', res);
  }
  return res;
}

export function getLeaveRequest(token, id) {
  const res = get(`${BASE}/${id}`, authHeaders(token), 'leave-get');
  if (expectStatus(res, 200, 'leaves.get')) {
    expectJsonField(res, 'id', 'leaves.get');
    logOk('leaves', 'get', res);
  } else {
    logFail('leaves', 'get', res, `id=${id}`);
  }
  return res;
}

/** Submit a leave request. Returns new request ID or null. */
export function submitLeaveRequest(token, leaveTypeId) {
  if (!leaveTypeId) {
    logSkip('leaves', 'submit', 'no leaveTypeId');
    return null;
  }
  const res = post(
    BASE,
    leaveRequestPayload(leaveTypeId),
    authHeaders(token),
    'leave-submit',
  );
  if (expectStatus(res, 201, 'leaves.submit')) {
    expectJsonField(res, 'id', 'leaves.submit');
    logOk('leaves', 'submit', res);
    return extractId(res);
  }
  logFail('leaves', 'submit', res);
  return null;
}

export function approveLeave(token, id) {
  if (!id) { logSkip('leaves', 'approve', 'no id'); return null; }
  const res = patch(
    `${BASE}/${id}/approve`,
    leaveApprovePayload(),
    authHeaders(token),
    'leave-approve',
  );
  if (expectStatus(res, 200, 'leaves.approve')) {
    logOk('leaves', 'approve', res);
  } else {
    logFail('leaves', 'approve', res, `id=${id}`);
  }
  return res;
}

export function rejectLeave(token, id) {
  if (!id) { logSkip('leaves', 'reject', 'no id'); return null; }
  const res = patch(
    `${BASE}/${id}/reject`,
    leaveRejectPayload(),
    authHeaders(token),
    'leave-reject',
  );
  if (expectStatus(res, 200, 'leaves.reject')) {
    logOk('leaves', 'reject', res);
  } else {
    logFail('leaves', 'reject', res, `id=${id}`);
  }
  return res;
}

export function cancelLeave(token, id) {
  if (!id) { logSkip('leaves', 'cancel', 'no id'); return null; }
  const res = patch(`${BASE}/${id}/cancel`, {}, authHeaders(token), 'leave-cancel');
  if (expectStatus(res, 200, 'leaves.cancel')) {
    logOk('leaves', 'cancel', res);
  } else {
    logFail('leaves', 'cancel', res, `id=${id}`);
  }
  return res;
}

// ── Leave Balances ─────────────────────────────────────────────────────────────

export function getMyBalances(token) {
  const year = new Date().getFullYear();
  const res = get(`${BASE}/balance?year=${year}`, authHeaders(token), 'leave-balance-my');
  if (expectStatus(res, 200, 'leaves.balance.my')) {
    logOk('leaves', 'balance.my', res);
  } else {
    logFail('leaves', 'balance.my', res);
  }
  return res;
}

export function getUserBalances(token, userId) {
  const year = new Date().getFullYear();
  const res = get(
    `${BASE}/balance/${userId}?year=${year}`,
    authHeaders(token),
    'leave-balance-user',
  );
  if (expectStatus(res, 200, 'leaves.balance.user')) {
    logOk('leaves', 'balance.user', res);
  } else {
    logFail('leaves', 'balance.user', res, `userId=${userId}`);
  }
  return res;
}

/**
 * Full leave lifecycle flow:
 *   create type → submit request → approve → check balance
 * Both tokens needed: requesterToken for the employee, approverToken for HR/manager.
 */
export function leaveLifecycleFlow(requesterToken, approverToken) {
  // Step 1 — ensure a leave type exists
  const typesRes  = listLeaveTypes(requesterToken);
  let leaveTypeId = null;
  try {
    const body = typesRes.json();
    const arr  = body.data || body.content || body;
    if (Array.isArray(arr) && arr.length > 0) {
      leaveTypeId = arr[0].id;
    }
  } catch (_) {}

  // If no leave type found, create one (needs LEAVE_MANAGE_TYPES)
  if (!leaveTypeId && approverToken) {
    leaveTypeId = createLeaveType(approverToken);
  }

  // Step 2 — submit a request
  const requestId = submitLeaveRequest(requesterToken, leaveTypeId);

  // Step 3 — manager approves
  if (requestId && approverToken) {
    getLeaveRequest(approverToken, requestId);
    approveLeave(approverToken, requestId);
  }

  // Step 4 — check my balance
  getMyBalances(requesterToken);
  listMyLeaveRequests(requesterToken);
}
