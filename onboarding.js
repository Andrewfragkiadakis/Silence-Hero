import { getDarkModeAutoSetting, applyTheme } from './theme.js';

const MOON_GLYPH = '<svg viewBox="0 0 24 24"><path d="M14.5 2.5c-5.6.4-10 5.1-10 10.9 0 6 4.9 10.9 10.9 10.9 3.6 0 6.8-1.8 8.7-4.5-1 .3-2 .5-3.1.5-6 0-10.9-4.9-10.9-10.9 0-2.5.9-4.8 2.4-6.6-.3-.1-.6-.2-1-.3z"/></svg>';
const WAVE_GLYPH = '<svg viewBox="0 0 24 24"><rect x="3.5" y="9" width="3.4" height="6" rx="1.7"/><rect x="10.3" y="4" width="3.4" height="16" rx="1.7"/><rect x="17.1" y="7" width="3.4" height="10" rx="1.7"/></svg>';

const TOTAL_STEPS = 3;
let step = 0;

function render() {
  document.querySelectorAll('.onboarding-step').forEach(el => {
    el.classList.toggle('active', +el.dataset.step === step);
  });
  document.querySelectorAll('.onboarding-dot').forEach(el => {
    el.classList.toggle('active', +el.dataset.dot === step);
  });
  document.getElementById('backBtn').classList.toggle('is-hidden', step === 0);
  document.getElementById('nextBtn').textContent = chrome.i18n.getMessage(
    step === TOTAL_STEPS - 1 ? 'onboardingGetStarted' : 'next'
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('iconNormalGlyph').innerHTML = WAVE_GLYPH;
  document.getElementById('iconQuietGlyph').innerHTML = MOON_GLYPH;

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

  document.getElementById('backBtn').textContent = chrome.i18n.getMessage('back');

  document.getElementById('nextBtn').addEventListener('click', () => {
    if (step < TOTAL_STEPS - 1) {
      step++;
      render();
      return;
    }
    window.close();
    // window.close() is a no-op in some contexts (e.g. the only remaining tab
    // in the window); keep the user moving into the app either way.
    setTimeout(() => { window.location.href = 'settings.html'; }, 300);
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    if (step > 0) { step--; render(); }
  });

  document.querySelectorAll('.onboarding-dot').forEach(dot => {
    dot.addEventListener('click', () => { step = +dot.dataset.dot; render(); });
  });

  render();

  const darkModeAuto = await getDarkModeAutoSetting();
  applyTheme(darkModeAuto);
});
