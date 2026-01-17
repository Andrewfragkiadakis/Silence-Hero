document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const quietVolumeInput = document.getElementById('quietVolume');
  const volumeDisplay = document.getElementById('volumeDisplay');
  const notificationsInput = document.getElementById('notifications');
  const soundEnabledInput = document.getElementById('soundEnabled');
  const darkModeAutoInput = document.getElementById('darkModeAuto');
  const saveBtn = document.getElementById('saveSettings');
  const toast = document.getElementById('toast');

  // --- Constants ---
  const DEFAULTS = {
    quietVolume: 30,
    notifications: true,
    soundEnabled: false,
    darkModeAuto: true
  };

  // --- 1. Load Settings ---
  chrome.storage.sync.get(DEFAULTS, (items) => {
    quietVolumeInput.value = items.quietVolume;
    volumeDisplay.textContent = `${items.quietVolume}%`;
    notificationsInput.checked = items.notifications;
    soundEnabledInput.checked = items.soundEnabled;
    darkModeAutoInput.checked = items.darkModeAuto;

    // Apply initial theme logic immediately
    checkTheme(items.darkModeAuto);
  });

  // --- 2. Input Listeners ---
  quietVolumeInput.addEventListener('input', (e) => {
    volumeDisplay.textContent = `${e.target.value}%`;
  });

  // --- 3. Save Logic ---
  saveBtn.addEventListener('click', () => {
    const settings = {
      quietVolume: parseInt(quietVolumeInput.value, 10),
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
        document.body.classList.add('dark-mode'); // You might need to add specific .dark-mode styles to CSS if standard media query isn't enough, 
        // but for now, let's rely on standard CSS. 
        // Actually, since I used media query in CSS, this JS class might be redundant 
        // UNLESS the user wants to FORCE dark mode at night even if OS is Light.
        // I will maintain the class toggling for that specific "force" behavior.
        return;
      }
    }
    // specific cleanup if not in force-window
    document.body.classList.remove('dark-mode');
  }
});