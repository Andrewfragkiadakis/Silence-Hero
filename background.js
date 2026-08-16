import { getEffectiveState } from './state.js';

// --- Icon Generation ---
// Each state gets a distinct glyph, not just a distinct color, so the icon
// stays legible for colorblind users (the previous plain-color dots measured
// far below the accepted colorblind-safety threshold in testing).
function drawGlyph(ctx, size, isQuiet, color) {
  const cx = size / 2;
  const cy = size / 2;

  if (isQuiet) {
    // Crescent moon: a white circle with a same-color circle painted over
    // part of it to carve the crescent shape.
    const moonR = size * 0.30;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
    ctx.fill();

    const punchR = moonR * 0.85;
    const offset = moonR * 0.55;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + offset, cy - offset * 0.3, punchR, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Soundwave: three rounded bars of varying height.
    const barW = size * 0.12;
    const gap = size * 0.09;
    const heights = [0.28, 0.62, 0.42];
    const totalW = barW * 3 + gap * 2;
    let x = cx - totalW / 2;

    ctx.fillStyle = '#ffffff';
    for (const hFrac of heights) {
      const barH = size * hFrac;
      const y = cy - barH / 2;
      const r = barW / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + barW, y, x + barW, y + barH, r);
      ctx.arcTo(x + barW, y + barH, x, y + barH, r);
      ctx.arcTo(x, y + barH, x, y, r);
      ctx.arcTo(x, y, x + barW, y, r);
      ctx.closePath();
      ctx.fill();
      x += barW + gap;
    }
  }
}

// Draw once at a large master size, then downscale per requested size - at
// 16px, drawing the glyph geometry directly makes the soundwave bars merge
// into an unrecognizable blob, since 1-2px shapes don't survive
// rasterization/anti-aliasing cleanly at that scale.
const ICON_MASTER_SIZE = 128;

function renderMasterIcon(color, isQuiet) {
  const canvas = new OffscreenCanvas(ICON_MASTER_SIZE, ICON_MASTER_SIZE);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(ICON_MASTER_SIZE / 2, ICON_MASTER_SIZE / 2, ICON_MASTER_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
  drawGlyph(ctx, ICON_MASTER_SIZE, isQuiet, color);
  return canvas;
}

function getIconData(masterCanvas, size) {
  try {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(masterCanvas, 0, 0, size, size);

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
    const masterCanvas = renderMasterIcon(color, isQuiet);
    const imageData = {};
    let generatedCount = 0;

    for (const size of iconSizes) {
      const data = masterCanvas ? getIconData(masterCanvas, size) : null;
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
let offscreenCloseTimer = null;

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

    // Sound clip is ~0.6s; close the document shortly after so it doesn't
    // linger in memory for the lifetime of the browser session.
    clearTimeout(offscreenCloseTimer);
    offscreenCloseTimer = setTimeout(() => {
      chrome.offscreen.closeDocument().catch(() => { });
    }, 1000);
  } catch (e) {
    console.error("Audio playback failed:", e);
  }
}

// --- Main Update Logic ---
async function updateState() {
  const { isQuiet } = await getEffectiveState();

  // 1. Check for State Change
  const data = await chrome.storage.local.get(['lastQuietState']);
  const lastState = data.lastQuietState;
  const stateChanged = lastState === undefined || lastState !== isQuiet;

  // 2. Update UI only when the state actually changed (avoid redrawing the
  // icon on every alarm tick when nothing changed)
  if (stateChanged) {
    updateIconUI(isQuiet);
  }

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

chrome.runtime.onInstalled.addListener(async (details) => {
  setupAlarm();
  updateState();

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: "onboarding.html" });
    // Initialize storage to prevent immediate notification
    const { isQuiet } = await getEffectiveState();
    chrome.storage.local.set({ lastQuietState: isQuiet });
  }
});

// --- Manual override (shared by the keyboard shortcut and the popup button) ---
async function toggleOverride() {
  // Manually force the opposite state until the next natural schedule
  // transition, then revert to following the schedule automatically.
  const effective = await getEffectiveState();
  await chrome.storage.local.set({
    manualOverride: {
      isQuiet: !effective.isQuiet,
      expires: effective.nextChange.getTime(),
      startedAt: Date.now()
    }
  });

  await updateState();
}

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-quiet-mode') toggleOverride();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'toggle-override') {
    toggleOverride().then(() => sendResponse({ ok: true }));
    return true; // keep the message channel open for the async response
  }
});

// Initial run
setupAlarm();
updateState();