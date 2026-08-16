import { getQuietHoursState } from './quietTimeLogic.js';

/**
 * Merges the natural (law-based) quiet hours state with any active
 * manual override, clearing the override once it expires.
 *
 * `prevChange` marks when the current (effective) state began - for a
 * natural state that's the last real transition; for an override it's the
 * moment the override was created - so callers can render a progress meter
 * of how far through the current window they are.
 *
 * @returns {Promise<{ isQuiet: boolean, nextChange: Date, prevChange: Date, overridden: boolean }>}
 */
export async function getEffectiveState() {
  const natural = getQuietHoursState();
  const { manualOverride } = await chrome.storage.local.get(['manualOverride']);

  if (manualOverride) {
    if (Date.now() < manualOverride.expires) {
      return {
        isQuiet: manualOverride.isQuiet,
        nextChange: natural.nextChange,
        prevChange: new Date(manualOverride.startedAt),
        overridden: true
      };
    }
    await chrome.storage.local.remove('manualOverride');
  }

  return { ...natural, overridden: false };
}
