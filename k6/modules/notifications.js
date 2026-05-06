/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Notifications Module
 * ─────────────────────────────────────────────────────────────────────────────
 * Note: SSE stream (/stream) is intentionally excluded — k6 does not support
 * persistent SSE connections. Test it separately with a dedicated HTTP client.
 *
 * Endpoint mapping (matches NotificationController):
 *   GET  /notifications              → listNotifications  (all, read + unread)
 *   GET  /notifications/unread       → (not called here; use listNotifications)
 *   GET  /notifications/unread-count → getUnreadCount
 *   PUT  /notifications/read-all     → markAllAsRead
 */

import { API, authHeaders }       from '../config/constants.js';
import { get, put, patch, del }   from '../helpers/http.js';
import { expectStatus,
         expectJsonField }        from '../helpers/checks.js';
import { logOk, logFail }        from '../helpers/logger.js';

const BASE = `${API}/notifications`;

/** GET /notifications — all notifications for the current user. */
export function listNotifications(token) {
  const res = get(BASE, authHeaders(token), 'notif-list');
  if (expectStatus(res, 200, 'notifications.list')) {
    logOk('notifications', 'list', res);
  } else {
    logFail('notifications', 'list', res);
  }
  return res;
}

/** GET /notifications/unread-count — number of unread notifications. */
export function getUnreadCount(token) {
  const res = get(`${BASE}/unread-count`, authHeaders(token), 'notif-unread-count');
  if (expectStatus(res, 200, 'notifications.unreadCount')) {
    expectJsonField(res, 'count', 'notifications.unreadCount');
    logOk('notifications', 'unreadCount', res);
  } else {
    logFail('notifications', 'unreadCount', res);
  }
  return res;
}

/** PATCH /notifications/{id}/read — mark a single notification as read. */
export function markAsRead(token, id) {
  const res = patch(`${BASE}/${id}/read`, {}, authHeaders(token), 'notif-mark-read');
  if (expectStatus(res, 200, 'notifications.markRead')) {
    logOk('notifications', 'markRead', res);
  } else {
    logFail('notifications', 'markRead', res, `id=${id}`);
  }
  return res;
}

/** PUT /notifications/read-all — mark all notifications as read (204 response). */
export function markAllAsRead(token) {
  const res = put(`${BASE}/read-all`, {}, authHeaders(token), 'notif-mark-all-read');
  // Backend returns 204 No Content — treat both 200 and 204 as success
  if (res.status === 204 || res.status === 200) {
    logOk('notifications', 'markAllRead', res);
  } else {
    logFail('notifications', 'markAllRead', res);
  }
  return res;
}

/** DELETE /notifications/{id} — delete a single notification. */
export function deleteNotification(token, id) {
  const res = del(`${BASE}/${id}`, authHeaders(token), 'notif-delete');
  if (expectStatus(res, 200, 'notifications.delete')) {
    logOk('notifications', 'delete', res);
    return true;
  }
  logFail('notifications', 'delete', res, `id=${id}`);
  return false;
}

/** Read-only notification flow (no SSE). */
export function notificationFlow(token) {
  const listRes = listNotifications(token);
  getUnreadCount(token);

  // Try to mark first notification as read if any exist
  try {
    const body    = listRes.json();
    const content = body.content || body.data || body;
    if (Array.isArray(content) && content.length > 0) {
      markAsRead(token, content[0].id);
    }
  } catch (_) {}

  markAllAsRead(token);
}
