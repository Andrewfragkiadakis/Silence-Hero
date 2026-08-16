import { getQuietHoursState } from './quietTimeLogic.js';

/**
 * Merges the natural (law-based) quiet hours state with any active
 * manual override, clearing the override once it expires.
 * @returns {Promise<{ isQuiet: boolean, nextChange: Date, overridden: boolean }>}
 */
export async function getEffectiveState() {
  const natural = getQuietHoursState();
  const { manualOverride } = await chrome.storage.local.get(['manualOverride']);

  if (manualOverride) {
    if (Date.now() < manualOverride.expires) {
      return { isQuiet: manualOverride.isQuiet, nextChange: natural.nextChange, overridden: true };
    }
    await chrome.storage.local.remove('manualOverride');
  }

  return { ...natural, overridden: false };
}
