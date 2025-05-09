function getMinutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
  }
  
  function isQuietTime() {
    const now = new Date();
    // *** Determine quiet hours based on Greek rules ***
    const minutes = now.getHours() * 60 + now.getMinutes();
    const month = now.getMonth(); // 0 = January, ... 11 = December
    const isSummer = month >= 3 && month <= 8; // April (3) to September (8) - Adjust if needed
    let middayQuiet = false;
    let nightQuiet = false;
  
  // In popup.js isQuietTime()
if (isSummer) {
    // Summer quiet: 15:00 to 17:30 and 23:00 to 07:00
    middayQuiet = (minutes >= 900 && minutes <= 1050); // 15:00 <= time <= 17:30
    nightQuiet = (minutes >= 1380 || minutes < 420);
} else {
    // Winter quiet: 15:30 to 17:30 and 22:00 to 07:30
    middayQuiet = (minutes >= 930 && minutes <= 1050); // 15:30 <= time <= 17:30
    nightQuiet = (minutes >= 1320 || minutes < 450);
}
    return middayQuiet || nightQuiet;
    // *** End of quiet hours determination ***
  }
  
  function getNextThreshold() {
    const now = new Date();
    const isCurrentQuiet = isQuietTime();
    const currentMinutes = getMinutesSinceMidnight(now);
    const month = now.getMonth();
    const isSummer = month >= 3 && month <= 8;
  
    let transitions = []; // [startMinute, endMinute, isQuiet]
    if (isSummer) {
        // Summer: Quiet 15:00-17:30 (900-1050), 23:00-07:00 (1380-420)
        transitions = [
            [420, 900, false],   // 07:00 - 15:00 Non-Quiet
            [900, 1050, true],   // 15:00 - 17:30 Quiet
            [1050, 1380, false], // 17:30 - 23:00 Non-Quiet
            [1380, 1440 + 420, true] // 23:00 - 07:00 (next day) Quiet
        ];
    } else {
        // Winter: Quiet 15:30-17:30 (930-1050), 22:00-07:30 (1320-450)
        transitions = [
            [450, 930, false],   // 07:30 - 15:30 Non-Quiet
            [930, 1050, true],   // 15:30 - 17:30 Quiet
            [1050, 1320, false], // 17:30 - 22:00 Non-Quiet
            [1320, 1440 + 450, true] // 22:00 - 07:30 (next day) Quiet
        ];
    }
  
    let nextChangeMinute = -1;
  
    for (const [start, end, quiet] of transitions) {
        const endCalc = (end > 1440) ? end : end % 1440;
        if (isCurrentQuiet === quiet) {
            if (start > endCalc) { // Overnight period
                if (currentMinutes >= start || currentMinutes < endCalc) {
                     nextChangeMinute = end;
                     break;
                 }
            } else { // Same-day period
                if (currentMinutes >= start && currentMinutes < endCalc) {
                    nextChangeMinute = end;
                    break;
                }
            }
        }
    }
  
    if (nextChangeMinute === -1) {
       let foundNext = false;
       for (const [start, end, quiet] of transitions) {
           if (currentMinutes < start) {
               nextChangeMinute = start;
               foundNext = true;
               break;
           }
       }
       if (!foundNext) {
           nextChangeMinute = transitions[0][0];
       }
    }
  
    const nextThreshold = new Date(now);
    const targetHour = Math.floor((nextChangeMinute % 1440) / 60);
    const targetMinute = nextChangeMinute % 60;
    nextThreshold.setHours(targetHour, targetMinute, 0, 0);
  
    if (nextChangeMinute >= 1440 || (nextThreshold < now && nextChangeMinute <= currentMinutes)) {
         nextThreshold.setDate(nextThreshold.getDate() + 1);
    }
    return nextThreshold;
  }
  
  function updateTheme() {
    const now = new Date();
    const hour = now.getHours();
    const body = document.body;
  
    if (hour >= 20 || hour < 6) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
  }
  
  function updateDisplay() {
    try {
      const now = new Date();
      const quiet = isQuietTime();
      const nextEvent = getNextThreshold();
      const diff = nextEvent - now;
  
      const positiveDiff = Math.max(0, diff);
  
      const hours = Math.floor(positiveDiff / 3600000);
      const minutes = Math.floor((positiveDiff % 3600000) / 60000);
      const seconds = Math.floor((positiveDiff % 60000) / 1000);
      const timeStr = String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
  
      const stateElement = document.getElementById("state");
      const timerElement = document.getElementById("timer");
      const nextEventElement = document.getElementById("nextEvent");
  
      if (!stateElement || !timerElement || !nextEventElement) {
          console.error("Popup DOM elements not found. HTML might not be fully loaded or IDs are incorrect.");
          if (intervalId) { // Clear interval if critical elements are missing
              clearInterval(intervalId);
          }
          // Display an error in the popup itself if possible
          if (document.body) {
              document.body.innerHTML = `<div style="color: red; padding: 10px; font-family: sans-serif;">Error: Popup elements missing.</div>`;
          }
          return;
      }
  
      const currentStateText = quiet ? "Quiet Hours" : "Non-Quiet Hours";
      stateElement.querySelector("strong").innerHTML = currentStateText;
      stateElement.className = quiet ? "state quiet" : "state non-quiet";
  
      timerElement.className = quiet ? "timer quiet" : "timer non-quiet";
  
      nextEventElement.innerHTML = `Next change at: ${nextEvent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
      timerElement.textContent = timeStr;
  
      updateTheme();
    } catch (error) {
      console.error("Error in updateDisplay:", error);
      if (intervalId) { // Clear interval on error to prevent repeated failures
          clearInterval(intervalId);
      }
      try {
          const body = document.body;
          if (body) {
              body.innerHTML = `<div style="color: red; padding: 10px; font-family: sans-serif;">Error: ${error.message}.<br>See extension console for details.</div>`;
          }
      } catch (displayError) {
          console.error("Error displaying error message in popup:", displayError);
      }
    }
  }
  
  let intervalId; // To store the interval ID
  
  try {
    // Initial display and theme update
    updateDisplay();
    // Update every second
    intervalId = setInterval(updateDisplay, 1000);
  } catch (initError) {
    console.error("Error initializing popup script:", initError);
    try {
      const body = document.body;
      if (body) {
          body.innerHTML = `<div style="color: red; padding: 10px; font-family: sans-serif;">Initialization Error: ${initError.message}.<br>See extension console for details.</div>`;
      }
    } catch (displayError) {
        console.error("Error displaying initialization error message in popup:", displayError);
    }
  }