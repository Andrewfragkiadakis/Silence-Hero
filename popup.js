function getMinutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
  }
  
  function isQuietTime() {
    const now = new Date();
    // First quiet period: 15:30 to 17:30
    const startFirst = new Date(now);
    startFirst.setHours(15, 30, 0, 0);
    const endFirst = new Date(now);
    endFirst.setHours(17, 30, 0, 0);
  
    // Second quiet period: 22:00 to next day's 7:30
    const startSecond = new Date(now);
    startSecond.setHours(22, 0, 0, 0);
    const endSecond = new Date(now);
    endSecond.setDate(endSecond.getDate() + 1);
    endSecond.setHours(7, 30, 0, 0);
  
    // Check if now is within first or second quiet period
    if ((now >= startFirst && now < endFirst) || (now >= startSecond && now < endSecond)) {
      return true;
    }
    return false;
  }
  
  function getNextThreshold() {
    const now = new Date();
    const isCurrentQuiet = isQuietTime();
  
    if (isCurrentQuiet) {
      // In quiet hours
      const startFirst = new Date(now);
      startFirst.setHours(15, 30, 0, 0);
      const endFirst = new Date(now);
      endFirst.setHours(17, 30, 0, 0);
      const startSecond = new Date(now);
      startSecond.setHours(22, 0, 0, 0);
      const endSecond = new Date(now);
      endSecond.setDate(endSecond.getDate() + 1);
      endSecond.setHours(7, 30, 0, 0);
  
      if (now >= startFirst && now < endFirst) {
        // First quiet period: next change at endFirst
        return endFirst;
      } else {
        // Second quiet period: next change at endSecond
        return endSecond;
      }
    } else {
      // Not in quiet hours
      const startFirst = new Date(now);
      startFirst.setHours(15, 30, 0, 0);
      const startSecond = new Date(now);
      startSecond.setHours(22, 0, 0, 0);
  
      // Find which non-quiet period we are in
      const endFirst = new Date(now);
      endFirst.setHours(17, 30, 0, 0);
      const endSecond = new Date(now);
      endSecond.setDate(endSecond.getDate() + 1);
      endSecond.setHours(7, 30, 0, 0);
  
      if (now < startFirst) {
        // Between endSecond and startFirst (non-quiet hours from endSecond to startFirst)
        return startFirst;
      } else if (now >= endFirst && now < startSecond) {
        // Between endFirst and startSecond (non-quiet hours from endFirst to startSecond)
        return startSecond;
      } else {
        // This should not happen as all cases should be covered
        throw new Error("Unexpected time range for non-quiet hours.");
      }
    }
  }
  
  function updateDisplay() {
    const now = new Date();
    const quiet = isQuietTime();
    const nextEvent = getNextThreshold();
    const diff = nextEvent - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const timeStr = String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
  
    const currentStateText = quiet ? "Quiet Hours" : "Non-Quiet Hours";
    document.getElementById("state").querySelector("strong").innerHTML = currentStateText;
    document.getElementById("state").className = quiet ? "state quiet" : "state non-quiet";
  
    document.getElementById("nextEvent").innerHTML = `Next change at: ${nextEvent.toLocaleTimeString()}`;
  
    document.getElementById("timer").textContent = timeStr;
  }
  
  updateDisplay();
  setInterval(updateDisplay, 1000);