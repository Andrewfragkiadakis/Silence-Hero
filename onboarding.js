import { getDarkModeAutoSetting, applyTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('onboardingTitle').textContent = chrome.i18n.getMessage('onboardingTitle');
  document.getElementById('onboardingSubtitle').textContent = chrome.i18n.getMessage('appDesc');

  document.getElementById('iconSectionTitle').textContent = chrome.i18n.getMessage('onboardingIconSectionTitle');
  document.getElementById('iconNormalTitle').textContent = chrome.i18n.getMessage('normalHours');
  document.getElementById('iconNormalDesc').textContent = chrome.i18n.getMessage('onboardingNormalDesc');
  document.getElementById('iconQuietTitle').textContent = chrome.i18n.getMessage('quietHours');
  document.getElementById('iconQuietDesc').textContent = chrome.i18n.getMessage('onboardingQuietDesc');

  document.getElementById('scheduleSectionTitle').textContent = chrome.i18n.getMessage('onboardingScheduleSectionTitle');
  document.getElementById('scheduleColAfternoon').textContent = chrome.i18n.getMessage('onboardingScheduleColAfternoon');
  document.getElementById('scheduleColNight').textContent = chrome.i18n.getMessage('onboardingScheduleColNight');
  document.getElementById('scheduleSummerLabel').textContent = chrome.i18n.getMessage('onboardingScheduleSummerLabel');
  document.getElementById('scheduleWinterLabel').textContent = chrome.i18n.getMessage('onboardingScheduleWinterLabel');
  document.getElementById('scheduleNote').textContent = chrome.i18n.getMessage('onboardingScheduleNote');

  document.getElementById('shortcutSectionTitle').textContent = chrome.i18n.getMessage('onboardingShortcutSectionTitle');
  document.getElementById('shortcutDesc').textContent = chrome.i18n.getMessage('onboardingShortcutDesc');

  const getStartedBtn = document.getElementById('getStarted');
  getStartedBtn.textContent = chrome.i18n.getMessage('onboardingGetStarted');
  getStartedBtn.addEventListener('click', () => {
    window.close();
    // window.close() is a no-op in some contexts (e.g. the only remaining tab
    // in the window); keep the user moving into the app either way.
    setTimeout(() => { window.location.href = 'settings.html'; }, 300);
  });

  const darkModeAuto = await getDarkModeAutoSetting();
  applyTheme(darkModeAuto);
});
