import { getQuietHoursState } from './quietTimeLogic.js';

// DOM Elements
const appNameEl = document.getElementById('appName');
const settingsButton = document.getElementById('settingsButton');
const statusCard = document.getElementById('statusCard');
const currentStatusEl = document.getElementById('currentStatus');
const statusPulse = document.getElementById('statusPulse');
const timerEl = document.getElementById('timer');
const nextChangeLabelEl = document.getElementById('nextChangeLabel');
const instructionEl = document.getElementById('instruction');

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
function updateDisplay() {
    const { isQuiet, nextChange } = getQuietHoursState();

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

    // Timer
    const now = new Date();
    const timeDiff = nextChange - now;
    timerEl.textContent = formatTime(timeDiff);

    // Next Change Tooltip/Text
    const nextTimeStr = nextChange.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    nextChangeLabelEl.textContent = `${chrome.i18n.getMessage("nextChange")} ${nextTimeStr}`;
}

/**
 * Initialize
 */
function init() {
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

    // Start Loop
    updateDisplay();
    setInterval(updateDisplay, 1000);
}

init();