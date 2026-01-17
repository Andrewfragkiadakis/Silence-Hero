export const CONSTANTS = {
  SUMMER: {
    MONTHS: [3, 4, 5, 6, 7, 8], // April (3) to September (8)
    TRANSITIONS: [
      { time: 420, isQuiet: false },   // 07:00 -> Not Quiet
      { time: 900, isQuiet: true },    // 15:00 -> Quiet
      { time: 1050, isQuiet: false },  // 17:30 -> Not Quiet
      { time: 1380, isQuiet: true }    // 23:00 -> Quiet
    ]
  },
  WINTER: {
    // Everything else
    TRANSITIONS: [
      { time: 450, isQuiet: false },   // 07:30 -> Not Quiet
      { time: 930, isQuiet: true },    // 15:30 -> Quiet
      { time: 1050, isQuiet: false },  // 17:30 -> Not Quiet
      { time: 1320, isQuiet: true }    // 22:00 -> Quiet
    ]
  }
};

/**
 * Helper to get minutes from midnight
 * @param {Date} date 
 */
function getMinutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Determines if a given date falls in Summer Season
 * @param {Date} date 
 */
function isSummer(date) {
  const month = date.getMonth();
  return CONSTANTS.SUMMER.MONTHS.includes(month);
}

/**
 * Get the config for a specific date
 * @param {Date} date 
 */
function getConfig(date) {
  return isSummer(date) ? CONSTANTS.SUMMER : CONSTANTS.WINTER;
}

/**
 * Returns the state of quiet hours and the next change date.
 * @returns {{ isQuiet: boolean, nextChange: Date }}
 */
export function getQuietHoursState() {
  const now = new Date();
  const currentMinutes = getMinutesOfDay(now);
  const config = getConfig(now);
  
  // 1. Determine current state
  // We sort transitions by time just to be safe
  const transitions = config.TRANSITIONS.sort((a, b) => a.time - b.time);
  
  // Default to the state of the last transition of the "previous day"
  // Which corresponds to the last entry in the list (since it wraps around)
  let currentState = transitions[transitions.length - 1].isQuiet;

  // Find where we are in today's timeline
  for (const trans of transitions) {
    if (currentMinutes >= trans.time) {
      currentState = trans.isQuiet;
    } else {
      break; 
    }
  }

  // 2. Determine Next Change
  let nextChangeDate = null;

  // Look for next transition later today
  for (const trans of transitions) {
    if (trans.time > currentMinutes) {
      nextChangeDate = new Date(now);
      nextChangeDate.setHours(0, trans.time, 0, 0);
      break;
    }
  }

  // If no transition later today, check tomorrow
  if (!nextChangeDate) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowConfig = getConfig(tomorrow);
    // The first transition of the day
    const firstTrans = tomorrowConfig.TRANSITIONS.sort((a, b) => a.time - b.time)[0];
    
    nextChangeDate = new Date(tomorrow);
    nextChangeDate.setHours(0, firstTrans.time, 0, 0);
  }

  return { isQuiet: currentState, nextChange: nextChangeDate };
}