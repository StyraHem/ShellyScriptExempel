// Shelly 1PM Mini Gen 3 - Tidmätning med daglig historik
// Mäter hur länge reläet är PÅ, nollställs vid midnatt, sparar 7 dagars historik

let CONFIG = {
  SWITCH_ID: 0,           // Relä-ID (vanligtvis 0)
  UPDATE_INTERVAL: 60000, // Uppdatera varje minut (ms)
  HISTORY_DAYS: 7         // Antal dagar att spara historik
};

let state = {
  running: false,
  startTime: 0,
  totalSeconds: 0,
  timer: null,
  midnightTimer: null
};

// Läs dagens tid från KVS
function loadTodayTime() {
  Shelly.call("KVS.Get", { key: "today_seconds" }, function(result, error_code, error_message) {
    if (error_code === 0 && result && result.value !== undefined) {
      state.totalSeconds = JSON.parse(result.value);
      print("Laddad tid för idag:", state.totalSeconds, "sekunder");
    } else {
      state.totalSeconds = 0;
      print("Ingen sparad tid, startar från 0");
    }
    
    // Kolla om reläet redan är PÅ vid start
    let switchStatus = Shelly.getComponentStatus("switch", CONFIG.SWITCH_ID);
    if (switchStatus && switchStatus.output === true) {
      startTimer();
    }
  });
}

// Spara dagens tid till KVS
function saveTodayTime() {
  Shelly.call("KVS.Set", {
    key: "today_seconds",
    value: JSON.stringify(state.totalSeconds)
  });
}

// Spara historik och nollställ
function saveDayAndReset() {
  print("Midnatt - sparar dagens tid och nollställer");
  
  // Hämta dagens datum
  let status = Shelly.getComponentStatus("sys");
  let date = new Date(status.unixtime * 1000);
  let dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Spara dagens värde i historik
  Shelly.call("KVS.Set", {
    key: "day_" + dateStr,
    value: JSON.stringify({
      date: dateStr,
      seconds: state.totalSeconds,
      minutes: Math.floor(state.totalSeconds / 60),
      hours: (state.totalSeconds / 3600).toFixed(2)
    })
  });
  
  // Rensa gammal historik (äldre än HISTORY_DAYS)
  cleanOldHistory();
  
  // Nollställ dagens räknare
  state.totalSeconds = 0;
  saveTodayTime();
  
  // Schemalägg nästa midnatt
  scheduleNextMidnight();
}

// Ta bort historik äldre än X dagar
function cleanOldHistory() {
  Shelly.call("KVS.List", {}, function(result) {
    if (result && result.keys) {
      let now = Date.now();
      let maxAge = CONFIG.HISTORY_DAYS * 24 * 60 * 60 * 1000;
      
      for (let i = 0; i < result.keys.length; i++) {
        let key = result.keys[i];
        if (key.indexOf("day_") === 0) {
          let dateStr = key.substring(4); // Ta bort "day_"
          let keyDate = new Date(dateStr).getTime();
          
          if (now - keyDate > maxAge) {
            print("Raderar gammal historik:", key);
            Shelly.call("KVS.Delete", { key: key });
          }
        }
      }
    }
  });
}

// Beräkna sekunder till nästa midnatt och schemalägg
function scheduleNextMidnight() {
  if (state.midnightTimer !== null) {
    Timer.clear(state.midnightTimer);
  }
  
  let status = Shelly.getComponentStatus("sys");
  let nowMs = status.unixtime * 1000;
  
  // Beräkna millisekunder sedan midnatt (UTC)
  let msPerDay = 24 * 60 * 60 * 1000;
  let msSinceMidnight = nowMs % msPerDay;
  let msUntilMidnight = msPerDay - msSinceMidnight;
  
  print("Schemalägg midnatt om", Math.floor(msUntilMidnight / 1000), "sekunder");
  
  state.midnightTimer = Timer.set(msUntilMidnight, false, saveDayAndReset);
}

// Uppdatera räknaren varje minut
function updateCounter() {
  if (state.running) {
    let elapsed = Date.now() - state.startTime;
    state.totalSeconds += Math.floor(elapsed / 1000);
    state.startTime = Date.now();
    
    saveTodayTime();
    
    let hours = (state.totalSeconds / 3600).toFixed(2);
    let minutes = Math.floor(state.totalSeconds / 60);
    print("Uppdaterad tid:", minutes, "min (", hours, "h)");
  }
}

// Starta tidmätning
function startTimer() {
  if (!state.running) {
    state.running = true;
    state.startTime = Date.now();
    print("Timer startad");
    
    // Starta uppdateringstimer
    state.timer = Timer.set(CONFIG.UPDATE_INTERVAL, true, updateCounter);
  }
}

// Stoppa tidmätning
function stopTimer() {
  if (state.running) {
    // Uppdatera en sista gång
    let elapsed = Date.now() - state.startTime;
    state.totalSeconds += Math.floor(elapsed / 1000);
    saveTodayTime();
    
    state.running = false;
    print("Timer stoppad. Total tid:", Math.floor(state.totalSeconds / 60), "minuter");
    
    // Stoppa uppdateringstimer
    if (state.timer !== null) {
      Timer.clear(state.timer);
      state.timer = null;
    }
  }
}

// Lyssna på switch-händelser
Shelly.addStatusHandler(function(status) {
  if (status.name === "switch" && status.id === CONFIG.SWITCH_ID) {
    if (status.delta.output !== undefined) {
      if (status.delta.output === true) {
        startTimer();
      } else {
        stopTimer();
      }
    }
  }
});

// Initiera
print("Tidmätningsskript startat");
loadTodayTime();
scheduleNextMidnight();

// HTTP endpoint för att läsa data
// GET http://shelly-ip/rpc/Script.Eval?code=getTimes()
function getTimes() {
  let result = {
    today_seconds: state.totalSeconds,
    today_minutes: Math.floor(state.totalSeconds / 60),
    today_hours: (state.totalSeconds / 3600).toFixed(2),
    running: state.running
  };
  
  print("Dagens tid:", JSON.stringify(result));
  return result;
}
