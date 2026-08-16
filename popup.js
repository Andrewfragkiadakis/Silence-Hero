import { getEffectiveState } from './state.js';
import { getDarkModeAutoSetting, applyTheme } from './theme.js';

// DOM Elements
const appNameEl = document.getElementById('appName');
const settingsButton = document.getElementById('settingsButton');
const statusCard = document.getElementById('statusCard');
const currentStatusEl = document.getElementById('currentStatus');
const ringFillEl = document.getElementById('ringFill');
const ringGlyphEl = document.getElementById('ringGlyph');
const timerEl = document.getElementById('timer');
const nextChangeLabelEl = document.getElementById('nextChangeLabel');
const instructionEl = document.getElementById('instruction');
const overrideBtn = document.getElementById('overrideBtn');
const overrideBtnLabelEl = document.getElementById('overrideBtnLabel');
const overrideHintEl = document.getElementById('overrideHint');

const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // matches the r=52 <circle> in popup.html
const MOON_GLYPH = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 2.5c-5.6.4-10 5.1-10 10.9 0 6 4.9 10.9 10.9 10.9 3.6 0 6.8-1.8 8.7-4.5-1 .3-2 .5-3.1.5-6 0-10.9-4.9-10.9-10.9 0-2.5.9-4.8 2.4-6.6-.3-.1-.6-.2-1-.3z"/></svg>';
const WAVE_GLYPH = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3.5" y="9" width="3.4" height="6" rx="1.7"/><rect x="10.3" y="4" width="3.4" height="16" rx="1.7"/><rect x="17.1" y="7" width="3.4" height="10" rx="1.7"/></svg>';

let darkModeAuto = true;

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.darkModeAuto) {
        darkModeAuto = changes.darkModeAuto.newValue;
        applyTheme(darkModeAuto);
    }
});

/**
 * Format milliseconds into HH:MM:SS
 * @param {number} ms 
 */
function formatTime(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Update the UI based on current state
 */
async function updateDisplay() {
    const { isQuiet, nextChange, prevChange, overridden } = await getEffectiveState();

    // Status Text & Styling
    if (isQuiet) {
        currentStatusEl.textContent = chrome.i18n.getMessage("quietHours");
        statusCard.classList.remove('is-normal');
        statusCard.classList.add('is-quiet');
    } else {
        currentStatusEl.textContent = chrome.i18n.getMessage("normalHours");
        statusCard.classList.remove('is-quiet');
        statusCard.classList.add('is-normal');
    }
    ringGlyphEl.innerHTML = isQuiet ? MOON_GLYPH : WAVE_GLYPH;

    // Timer
    const now = new Date();
    const timeDiff = nextChange - now;
    timerEl.textContent = formatTime(timeDiff);

    // Next Change Tooltip/Text
    const nextTimeStr = nextChange.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    nextChangeLabelEl.textContent = `${chrome.i18n.getMessage("nextChange")} ${nextTimeStr}`;

    // Progress ring: drains from full to empty across the current window
    const duration = nextChange - prevChange;
    const elapsed = now - prevChange;
    const fraction = duration > 0 ? Math.min(1, Math.max(0, elapsed / duration)) : 0;
    ringFillEl.style.strokeDashoffset = (RING_CIRCUMFERENCE * fraction).toFixed(1);

    // Override control
    overrideBtn.classList.toggle('is-active', overridden);
    overrideBtnLabelEl.textContent = chrome.i18n.getMessage(overridden ? "overrideCancel" : "override");
    overrideHintEl.textContent = chrome.i18n.getMessage(overridden ? "overrideHintActive" : "overrideHintDefault");
}

/**
 * Initialize
 */
async function init() {
    // Localization
    appNameEl.textContent = chrome.i18n.getMessage("appName");
    instructionEl.textContent = chrome.i18n.getMessage("instruction");
    settingsButton.title = chrome.i18n.getMessage("settings");

    // Event Listeners
    settingsButton.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('settings.html'));
        }
    });

    overrideBtn.addEventListener('click', async () => {
        overrideBtn.disabled = true;
        try {
            await chrome.runtime.sendMessage({ type: 'toggle-override' });
            await updateDisplay();
        } finally {
            overrideBtn.disabled = false;
        }
    });

    // Theme
    darkModeAuto = await getDarkModeAutoSetting();
    applyTheme(darkModeAuto);

    // Start Loop
    updateDisplay();
    setInterval(() => {
        updateDisplay();
        applyTheme(darkModeAuto);
    }, 1000);
}

init();