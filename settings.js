document.addEventListener('DOMContentLoaded', function() {
    // Apply dark mode if needed
    applyTheme();
    
    // Load saved settings
    chrome.storage.sync.get(
      [
        'quietVolume', 
        'notifications', 
        'soundEnabled', 
        'darkModeAuto'
      ], 
      function(result) {
        document.getElementById('quietVolume').value = result.quietVolume || 30;
        document.getElementById('volumeDisplay').textContent = (result.quietVolume || 30) + '%';
        document.getElementById('notifications').checked = result.notifications !== false; // Default to true
        document.getElementById('soundEnabled').checked = result.soundEnabled || false;
        document.getElementById('darkModeAuto').checked = result.darkModeAuto !== false; // Default to true
      }
    );
    
    // Update volume display when slider changes
    document.getElementById('quietVolume').addEventListener('input', function() {
      document.getElementById('volumeDisplay').textContent = this.value + '%';
    });
    
    // Save settings
    document.getElementById('saveSettings').addEventListener('click', function() {
      const quietVolume = parseInt(document.getElementById('quietVolume').value);
      const notifications = document.getElementById('notifications').checked;
      const soundEnabled = document.getElementById('soundEnabled').checked;
      const darkModeAuto = document.getElementById('darkModeAuto').checked;
      
      chrome.storage.sync.set({
        quietVolume: quietVolume,
        notifications: notifications,
        soundEnabled: soundEnabled,
        darkModeAuto: darkModeAuto
      }, function() {
        // Show saved confirmation
        const successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'block';
        
        setTimeout(function() {
          successMessage.style.display = 'none';
        }, 3000);
      });
    });
    
    // Dark mode toggle based on system preference or time
    function applyTheme() {
      chrome.storage.sync.get(['darkModeAuto'], function(result) {
        const darkModeAuto = result.darkModeAuto !== false; // Default to true
        
        if (darkModeAuto) {
          const now = new Date();
          const hour = now.getHours();
          
          // Dark mode between 8 PM (20) and 6 AM (exclusive)
          if (hour >= 20 || hour < 6) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
        }
      });
    }
  });
  