/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Logger — Structured debug output for k6
 * ─────────────────────────────────────────────────────────────────────────────
 * Controlled by the LOG_LEVEL environment variable:
 *
 *   k6 run --env LOG_LEVEL=debug main.js   → verbose output
 *   k6 run --env LOG_LEVEL=info  main.js   → only important events (default)
 *   k6 run --env LOG_LEVEL=none  main.js   → silent
 */

const LEVEL = (__ENV.LOG_LEVEL || 'info').toLowerCase();

function shouldLog(level) {
  if (LEVEL === 'none')  return false;
  if (LEVEL === 'debug') return true;
  if (LEVEL === 'info')  return level !== 'debug';
  return false;
}

// ── Log a successful response ──────────────────────────────────────────────────
export function logOk(module, action, res) {
  if (!shouldLog('info')) return;
  console.log(`[✓] ${module}.${action} → ${res.status} (${Math.round(res.timings.duration)}ms)`);
}

// ── Log a failure ──────────────────────────────────────────────────────────────
export function logFail(module, action, res, extra = '') {
  if (!shouldLog('info')) return;
  const body = res.body ? res.body.substring(0, 200) : '(no body)';
  console.error(`[✗] ${module}.${action} → ${res.status} | ${extra} | body: ${body}`);
}

// ── Log a debug message (only visible in debug mode) ──────────────────────────
export function logDebug(module, message) {
  if (!shouldLog('debug')) return;
  console.log(`[D] ${module} | ${message}`);
}

// ── Log the start of a user scenario ──────────────────────────────────────────
export function logScenario(name) {
  if (!shouldLog('info')) return;
  console.log(`\n── Scenario: ${name} ─────────────────────`);
}

// ── Log a skipped step (e.g. because a dependency failed) ─────────────────────
export function logSkip(module, action, reason) {
  if (!shouldLog('info')) return;
  console.warn(`[~] ${module}.${action} SKIPPED — ${reason}`);
}
