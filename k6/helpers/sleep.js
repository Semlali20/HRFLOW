/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Sleep Helpers — Realistic think-time simulation
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { sleep } from 'k6';

// Random float between min and max
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/** Short pause — between actions within the same page/screen */
export function thinkShort()  { sleep(rand(0.3, 0.8)); }

/** Medium pause — between logical steps (e.g. after submitting a form) */
export function thinkMedium() { sleep(rand(0.8, 1.5)); }

/** Long pause — between major actions (e.g. navigating to a new section) */
export function thinkLong()   { sleep(rand(1.5, 3.0)); }

/** Custom sleep */
export function thinkFor(seconds) { sleep(seconds); }
