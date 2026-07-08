// ============================================================
//  Router-vakt för Shelly Plug S (Gen3 / Plus) — switchbar plugg
//  ------------------------------------------------------------
//  Startar om routern (bryter strömmen en stund) om internet
//  varit nere längre än X minuter.
//
//  Loop-skydd:
//   1) Internet måste vara nere i minst "minutesDownBeforeRestart".
//   2) Efter varje omstart pausas kontrollerna så routern hinner
//      starta och koppla upp.
//   3) Efter "fastRestarts" snabba omstarter GER DEN INTE UPP – den
//      går över i ett LÅNGSAMT läge och fortsätter försöka, men bara
//      var "slowRetryMinutes" (skonsamt vid t.ex. operatörsavbrott).
//   Räknarna nollställs så fort internet är tillbaka -> snabbt läge igen.
//
//  Kräver en switchbar Shelly med skriptmotor (mJS), t.ex.
//  Shelly Plug S Gen3 (SHELLY-G3-PLUG-S). En ren mätar-plugg
//  (Plug PM) fungerar INTE – den kan inte bryta strömmen.
//  Routern kopplas in i pluggen.
// ============================================================

let CONFIG = {
  switchId: 0,                                          // Shelly Plug S har en switch = id 0
  checkUrl: "http://clients3.google.com/generate_204",  // svarar HTTP 204 när nätet funkar
  checkEverySec: 60,                                    // hur ofta internet kollas
  minutesDownBeforeRestart: 5,                          // nedtid innan första omstart
  powerOffSec: 20,                                      // hur länge strömmen bryts
  bootGraceMinutes: 5,                                  // paus efter omstart (snabbt läge)
  fastRestarts: 3,                                      // antal snabba omstarter innan långsamt läge
  slowRetryMinutes: 60,                                 // långsamt läge: tid mellan omstarter
  httpTimeoutSec: 8,
};

let failsNeeded = Math.ceil(CONFIG.minutesDownBeforeRestart * 60 / CONFIG.checkEverySec);

let failCount = 0;
let restartCount = 0;
let graceLeft = 0;
let busy = false;

function log(msg) { print("[router-vakt] " + msg); }
function minutesToChecks(min) { return Math.ceil(min * 60 / CONFIG.checkEverySec); }

function powerCycle(slow) {
  busy = true;
  log("Bryter strömmen i " + CONFIG.powerOffSec + " s ...");
  Shelly.call("Switch.Set", { id: CONFIG.switchId, on: false }, function () {
    Timer.set(CONFIG.powerOffSec * 1000, false, function () {
      Shelly.call("Switch.Set", { id: CONFIG.switchId, on: true }, function () {
        let graceMin = slow ? CONFIG.slowRetryMinutes : CONFIG.bootGraceMinutes;
        graceLeft = minutesToChecks(graceMin);
        log("Ström på igen. Väntar " + graceMin + " min" + (slow ? " (långsamt läge)" : "") + ".");
        failCount = 0;
        busy = false;
      });
    });
  });
}

function onCheck(result, errCode) {
  let online = (errCode === 0 && result && result.code >= 200 && result.code < 400);
  if (online) {
    if (failCount > 0 || restartCount > 0) log("Internet OK igen – nollställer (snabbt läge).");
    failCount = 0;
    restartCount = 0;
    return;
  }
  failCount++;
  // I långsamt läge räcker en koll efter grace-pausen, eftersom själva
  // pausen redan är fördröjningen mellan omstarter.
  let slowMode = (restartCount >= CONFIG.fastRestarts);
  let threshold = slowMode ? 1 : failsNeeded;
  log("Internet nere (" + failCount + "/" + threshold + ")" + (slowMode ? " [långsamt läge]" : "") + ".");
  if (failCount < threshold) return;

  restartCount++;
  let nextSlow = (restartCount >= CONFIG.fastRestarts);
  log("Startar om routern (omstart #" + restartCount + ")" + (nextSlow ? " – långsamt läge" : "") + ".");
  powerCycle(nextSlow);
}

function tick() {
  if (busy) return;
  if (graceLeft > 0) { graceLeft--; return; }
  Shelly.call("HTTP.GET", { url: CONFIG.checkUrl, timeout: CONFIG.httpTimeoutSec }, onCheck);
}

log("Startad. Kollar var " + CONFIG.checkEverySec + " s, första omstart efter " +
    CONFIG.minutesDownBeforeRestart + " min nere, sedan " + CONFIG.fastRestarts +
    " snabba omstarter och därefter långsamt läge (var " + CONFIG.slowRetryMinutes + " min).");
Timer.set(CONFIG.checkEverySec * 1000, true, tick);
