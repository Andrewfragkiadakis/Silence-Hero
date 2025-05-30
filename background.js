// Determines if the current time is within the quiet hours.
function isQuietTime() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const month = now.getMonth(); // 0 = January, ... 11 = December
  const isSummer = month >= 3 && month <= 8; // April (3) to September (8)
  
  let middayQuiet = false;
  let nightQuiet = false;
  
  if (isSummer) {
    // Summer quiet: 15:00 to 17:30 and 23:00 to 07:00
    middayQuiet = (minutes >= 900 && minutes <= 1050);
    nightQuiet = (minutes >= 1380 || minutes < 420);
  } else {
    // Winter quiet: 15:30 to 17:30 and 22:00 to 07:30
    middayQuiet = (minutes >= 930 && minutes <= 1050);
    nightQuiet = (minutes >= 1320 || minutes < 450);
  }
  
  return middayQuiet || nightQuiet;
}

// Generates ImageData for a circular icon of the specified size and color.
function getIconData(color, size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  return ctx.getImageData(0, 0, size, size);
}

// Updates the extension icon based on the current time.
function updateIcon() {
  const quiet = isQuietTime();
  const color = quiet ? 'red' : 'green';
  const imageData = {
    "16": getIconData(color, 16),
    "32": getIconData(color, 32),
    "48": getIconData(color, 48),
    "128": getIconData(color, 128)
  };
  
  chrome.action.setIcon({ imageData: imageData });
}

// Set an alarm to update the icon every minute.
chrome.alarms.create('updateIcon', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateIcon') {
    updateIcon();
  }
});

// Initialize command listener - this was causing the error
if (chrome.commands) {
  chrome.commands.onCommand.addListener((command) => {
    console.log(`Command received: ${command}`);
    if (command === 'toggle-quiet-mode') {
      // Handle your command logic here
      console.log('Toggling quiet mode');
    }
  });
}

// Update the icon immediately when the service worker starts.
updateIcon();

// Listen for runtime messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateIcon') {
    updateIcon();
    sendResponse({success: true});
  }
  return true; // Keep message channel open for async response
});
