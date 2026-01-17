import { getQuietHoursState } from './quietTimeLogic.js';

// --- Icon Generation ---
function getIconData(color, size) {
  try {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);
    const center = size / 2;
    const radius = size / 2;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    return ctx.getImageData(0, 0, size, size);
  } catch (error) {
    console.error(`Error generating icon:`, error);
    return null;
  }
}

function updateIconUI(isQuiet) {
  try {
    const color = isQuiet ? '#D32F2F' : '#388E3C';
    const stateText = isQuiet ? chrome.i18n.getMessage("quietHours") : chrome.i18n.getMessage("normalHours");

    const iconSizes = [16, 32, 48, 128];
    const imageData = {};
    let generatedCount = 0;

    for (const size of iconSizes) {
      const data = getIconData(color, size);
      if (data) {
        imageData[String(size)] = data;
        generatedCount++;
      }
    }

    if (generatedCount === iconSizes.length) {
      chrome.action.setIcon({ imageData: imageData }).catch(() => { });
    } else {
      const basePath = isQuiet ? "icons/red-" : "icons/green-";
      chrome.action.setIcon({
        path: {
          "16": `${basePath}16.png`,
          "32": `${basePath}32.png`,
          "48": `${basePath}48.png`,
          "128": `${basePath}128.png`
        }
      }).catch(() => { });
    }

    chrome.action.setTitle({ title: `Silence Hero: ${stateText}` });
  } catch (error) {
    console.error('Error updating UI:', error);
  }
}

// --- Sound Logic (Offscreen) ---
async function playSound() {
  try {
    const offscreenUrl = chrome.runtime.getURL('offscreen.html');

    // check if it exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl]
    });

    if (existingContexts.length === 0) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Notification sound',
      });
    }

    chrome.runtime.sendMessage({ target: 'offscreen', type: 'play_sound' });
  } catch (e) {
    console.error("Audio playback failed:", e);
  }
}

// --- Main Update Logic ---
async function updateState() {
  const { isQuiet } = getQuietHoursState();

  // 1. Update UI (Always)
  updateIconUI(isQuiet);

  // 2. Check for State Change
  const data = await chrome.storage.local.get(['lastQuietState']);
  const lastState = data.lastQuietState;

  // Only trigger if we have a previous state to compare against (don't alert on browser startup/fresh install)
  if (lastState !== undefined && lastState !== isQuiet) {

    const settings = await chrome.storage.sync.get(['notifications', 'soundEnabled']);

    // Notifications
    if (settings.notifications !== false) { // Default true
      const title = isQuiet ? chrome.i18n.getMessage("quietHours") : chrome.i18n.getMessage("normalHours");
      const msg = isQuiet ? chrome.i18n.getMessage("instruction") : "You can play music normally."; // Simplify message

      // Note: Notifications require local file paths for icons usually
      const iconPath = isQuiet ? "icons/red-48.png" : "icons/green-48.png";

      chrome.notifications.create({
        type: 'basic',
        iconUrl: iconPath,
        title: "Silence Hero: " + title,
        message: msg,
        priority: 1
      });
    }

    // Sound
    if (settings.soundEnabled) {
      playSound();
    }
  }

  // Save current state
  await chrome.storage.local.set({ lastQuietState: isQuiet });
}


// --- Alarms & Initialization ---
async function setupAlarm() {
  const alarm = await chrome.alarms.get('updateIcon');
  if (!alarm) {
    chrome.alarms.create('updateIcon', { periodInMinutes: 1 });
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateIcon') {
    updateState();
  }
});

chrome.runtime.onStartup.addListener(() => {
  setupAlarm();
  updateState();
});

chrome.runtime.onInstalled.addListener((details) => {
  setupAlarm();
  updateState();

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: "settings.html" });
    // Initialize storage to prevent immediate notification
    const { isQuiet } = getQuietHoursState();
    chrome.storage.local.set({ lastQuietState: isQuiet });
  }
});

// Initial run
setupAlarm();
updateState();