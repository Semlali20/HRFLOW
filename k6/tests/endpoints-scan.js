/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ENDPOINTS SCAN — Reads endpoint list from data/endpoints.json
 * ─────────────────────────────────────────────────────────────────────────────
 * A lightweight availability sweep that hits every GET endpoint once and
 * verifies it returns a non-5xx status. Useful as a post-deploy health check.
 *
 * Command:
 *   k6 run k6/tests/endpoints-scan.js
 *   k6 run --env ADMIN_EMAIL=houarimehdi7@gmail.com --env ADMIN_PASSWORD=39EAFC8e6e@Rh464 \
 *           k6/tests/endpoints-scan.js
 */

import { SCAN_OPTIONS }    from '../config/options.js';
import { BASE_URL }        from '../config/constants.js';
import { login }           from '../modules/auth.js';
import { get }             from '../helpers/http.js';
import { authHeaders }     from '../config/constants.js';
import { expectOneOfStatus,
         expectFastResponse } from '../helpers/checks.js';
import { logOk, logFail,
         logScenario }     from '../helpers/logger.js';
import { thinkShort }      from '../helpers/sleep.js';

export const options = SCAN_OPTIONS;

// Load endpoint manifest once
const MANIFEST = JSON.parse(open('../data/endpoints.json'));

const EMAIL    = __ENV.ADMIN_EMAIL    || 'houarimehdi7@gmail.com';
const PASSWORD = __ENV.ADMIN_PASSWORD || '39EAFC8e6e@Rh464';

// setup() runs once before all VUs start — perfect for obtaining a shared token
export function setup() {
  const token = login(EMAIL, PASSWORD);
  if (!token) {
    throw new Error('Setup failed: could not authenticate admin user');
  }
  console.log('Setup complete — admin token obtained');
  return { token };
}

export default function ({ token }) {
  logScenario('ENDPOINTS SCAN');

  for (const group of MANIFEST.groups) {
    for (const ep of group.endpoints) {
      if (ep.method !== 'GET') continue; // scan only reads

      const url     = `${BASE_URL}${ep.path}`;
      const headers = group.requiresAuth ? authHeaders(token) : {};
      const res     = get(url, headers, ep.tag);

      // Accept 200, 204 — NOT 401, 403, 5xx
      const ok = expectOneOfStatus(res, [200, 204], ep.tag);
      expectFastResponse(res, 2000, ep.tag);

      if (ok) {
        logOk('scan', ep.tag, res);
      } else {
        logFail('scan', ep.tag, res, `path=${ep.path}`);
      }

      thinkShort();
    }
  }
}
