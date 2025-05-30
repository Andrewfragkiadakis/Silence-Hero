function isQuietTime() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const month = now.getMonth();
    const isSummer = month >= 3 && month <= 8;
    
    let middayQuiet, nightQuiet;
    
    if (isSummer) {
      middayQuiet = (minutes >= 900 && minutes <= 1050);
      nightQuiet = (minutes >= 1380 || minutes < 420);
    } else {
      middayQuiet = (minutes >= 930 && minutes <= 1050);
      nightQuiet = (minutes >= 1320 || minutes < 450);
    }
    
    return middayQuiet || nightQuiet;
  }
  
  function getNextThreshold() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const month = now.getMonth();
    const isSummer = month >= 3 && month <= 8;
    
    const transitions = isSummer ? 
      [[420, 900], [900, 1050], [1050, 1380], [1380, 1440 + 420]] :
      [[450, 930], [930, 1050], [1050, 1320], [1320, 1440 + 450]];
    
    let nextChangeMinute = transitions.find(([start, end]) => 
      (currentMinutes >= start && currentMinutes < end) || 
      (start > end && (currentMinutes >= start || currentMinutes < end))
    )?.[1] ?? transitions[0][0];
    
    const nextThreshold = new Date(now);
    nextThreshold.setHours(0, nextChangeMinute, 0, 0);
    if (nextThreshold <= now) {
      nextThreshold.setDate(nextThreshold.getDate() + 1);
    }
    
    return nextThreshold;
  }
  
  export { isQuietTime, getNextThreshold };
  