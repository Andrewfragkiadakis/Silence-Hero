// Shared "Auto Dark Mode" logic used by popup.js, settings.js, and onboarding.js.
const DARK_WINDOW_START_HOUR = 20; // 8 PM
const DARK_WINDOW_END_HOUR = 6;    // 6 AM

function isWithinAutoDarkWindow(date = new Date()) {
  const hour = date.getHours();
  return hour >= DARK_WINDOW_START_HOUR || hour < DARK_WINDOW_END_HOUR;
}

export async function getDarkModeAutoSetting() {
  const { darkModeAuto } = await chrome.storage.sync.get({ darkModeAuto: true });
  return darkModeAuto;
}

export function applyTheme(darkModeAuto) {
  document.body.classList.toggle('dark-mode', darkModeAuto && isWithinAutoDarkWindow());
}
