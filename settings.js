document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const notificationsInput = document.getElementById('notifications');
  const soundEnabledInput = document.getElementById('soundEnabled');
  const darkModeAutoInput = document.getElementById('darkModeAuto');
  const saveBtn = document.getElementById('saveSettings');
  const toast = document.getElementById('toast');

  // --- Constants ---
  const DEFAULTS = {
    notifications: true,
    soundEnabled: false,
    darkModeAuto: true
  };

  // --- 1. Load Settings ---
  chrome.storage.sync.get(DEFAULTS, (items) => {
    notificationsInput.checked = items.notifications;
    soundEnabledInput.checked = items.soundEnabled;
    darkModeAutoInput.checked = items.darkModeAuto;

    // Apply initial theme logic immediately
    checkTheme(items.darkModeAuto);
  });

  // --- 3. Save Logic ---
  saveBtn.addEventListener('click', () => {
    const settings = {
      notifications: notificationsInput.checked,
      soundEnabled: soundEnabledInput.checked,
      darkModeAuto: darkModeAutoInput.checked
    };

    chrome.storage.sync.set(settings, () => {
      // Show Toast
      showToast();
      // Re-check theme
      checkTheme(settings.darkModeAuto);
    });
  });

  // --- Helper: Toast Notification ---
  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // --- Helper: Theme Logic ---
  function checkTheme(autoDarkEnabled) {
    if (autoDarkEnabled) {
      const hour = new Date().getHours();
      // 8 PM (20) to 6 AM (6)
      if (hour >= 20 || hour < 6) {
        document.body.classList.add('dark-mode');
        return;
      }
    }
    // specific cleanup if not in force-window
    document.body.classList.remove('dark-mode');
  }
});