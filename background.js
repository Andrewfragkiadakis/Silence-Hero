import { getQuietHoursState } from './quietTimeLogic.js';

// Generates ImageData for a circular icon of the specified size and color.
function getIconData(color, size) {
  try {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error(`Failed to get 2D context for OffscreenCanvas of size ${size}`);
      return null;
    }

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Dynamic Icon: Circle with a clear indicator
    const center = size / 2;
    const radius = size / 2;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    return ctx.getImageData(0, 0, size, size);
  } catch (error) {
    console.error(`Error in getIconData for color ${color}, size ${size}:`, error);
    return null;
  }
}

// Updates the extension icon based on the current time.
function updateIcon() {
  try {
    const { isQuiet } = getQuietHoursState();
    const color = isQuiet ? '#D32F2F' : '#388E3C'; // Material Red 700 / Green 700
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
      chrome.action.setIcon({ imageData: imageData })
        .catch(e => console.error("Error setting icon:", e));
    } else {
      // Fallback
      const basePath = isQuiet ? "icons/red-" : "icons/green-";
      chrome.action.setIcon({
        path: {
          "16": `${basePath}16.png`,
          "32": `${basePath}32.png`,
          "48": `${basePath}48.png`,
          "128": `${basePath}128.png`
        }
      }).catch(e => console.error("Error fallback icon:", e));
    }

    // Update Title (Tooltip)
    chrome.action.setTitle({ title: `Silence Hero: ${stateText}` });

    // Update Badge (optional, but helpful "GLANCE" factor)
    // chrome.action.setBadgeText({ text: isQuiet ? "Q" : "" });
    // chrome.action.setBadgeBackgroundColor({ color: isQuiet ? "#D32F2F" : "#388E3C" });

  } catch (error) {
    console.error('Error in updateIcon:', error);
  }
}

// Manage the alarm for periodic icon updates.
async function setupAlarm() {
  const alarm = await chrome.alarms.get('updateIcon');
  if (!alarm) {
    chrome.alarms.create('updateIcon', { periodInMinutes: 1 });
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateIcon') {
    updateIcon();
  }
});

// Listener for extension startup or installation
chrome.runtime.onStartup.addListener(() => {
  setupAlarm();
  updateIcon();
});

chrome.runtime.onInstalled.addListener((details) => {
  setupAlarm();
  updateIcon();

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: "settings.html" });
  }
});

// Initial setup
setupAlarm();
updateIcon();