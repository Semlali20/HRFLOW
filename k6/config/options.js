/**
 * ─────────────────────────────────────────────────────────────────────────────
 * k6 Test Options — HRFLOW API
 * ─────────────────────────────────────────────────────────────────────────────
 * Central place for all load-test profiles.
 * Import the profile you need in each test file:
 *
 *   import { LOAD_OPTIONS } from '../config/options.js';
 *   export const options = LOAD_OPTIONS;
 */

// ── Shared thresholds (applied to every test profile) ─────────────────────────
const THRESHOLDS = {
  // 95% of requests must finish in under 800 ms
  http_req_duration: ['p(95)<800', 'p(99)<1500'],
  // Less than 1% of requests may fail
  http_req_failed: ['rate<0.01'],
  // Custom check pass-rate (defined per test)
  checks: ['rate>0.99'],
};

// ── SMOKE — quick sanity check (1 VU, 30 s) ───────────────────────────────────
export const SMOKE_OPTIONS = {
  vus: 1,
  duration: '30s',
  thresholds: {
    ...THRESHOLDS,
    http_req_duration: ['p(95)<2000'], // more lenient for smoke
  },
};

// ── LOAD — normal expected production traffic ──────────────────────────────────
export const LOAD_OPTIONS = {
  stages: [
    { duration: '1m',  target: 10  }, // ramp-up to 10 VUs
    { duration: '3m',  target: 10  }, // steady load
    { duration: '1m',  target: 25  }, // scale up
    { duration: '3m',  target: 25  }, // steady at 25 VUs
    { duration: '1m',  target: 0   }, // ramp-down
  ],
  thresholds: THRESHOLDS,
};

// ── STRESS — find the breaking point ──────────────────────────────────────────
export const STRESS_OPTIONS = {
  stages: [
    { duration: '2m',  target: 50  }, // ramp to 50
    { duration: '5m',  target: 50  }, // hold
    { duration: '2m',  target: 100 }, // ramp to 100
    { duration: '5m',  target: 100 }, // hold
    { duration: '2m',  target: 200 }, // push hard
    { duration: '5m',  target: 200 }, // hold
    { duration: '2m',  target: 0   }, // cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed:   ['rate<0.05'], // allow up to 5% errors under stress
  },
};

// ── SOAK — extended duration to catch memory/resource leaks ───────────────────
export const SOAK_OPTIONS = {
  stages: [
    { duration: '2m',  target: 20 }, // ramp-up
    { duration: '2h',  target: 20 }, // hold for 2 hours
    { duration: '2m',  target: 0  }, // ramp-down
  ],
  thresholds: THRESHOLDS,
};

// ── SPIKE — sudden traffic burst (DDoS-like simulation) ───────────────────────
export const SPIKE_OPTIONS = {
  stages: [
    { duration: '10s', target: 5   }, // warm up
    { duration: '30s', target: 200 }, // instant spike
    { duration: '1m',  target: 200 }, // hold spike
    { duration: '30s', target: 5   }, // quick drop
    { duration: '30s', target: 0   }, // cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed:   ['rate<0.10'],
  },
};

// ── PER-ENDPOINT SCAN — lightweight, 1 VU per endpoint group ──────────────────
export const SCAN_OPTIONS = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed:   ['rate<0.05'],
  },
};
