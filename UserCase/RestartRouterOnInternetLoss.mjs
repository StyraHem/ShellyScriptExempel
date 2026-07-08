// ============================================================
//  Router-vakt för Shelly Plug S / Plug M
//  ------------------------------------------------------------
//  Startar om routern (bryter strömmen en stund) om internet
//  varit nere längre än X minuter.
//
//  Loop-skydd (så den INTE startar om i evighet):
//   1) Internet måste vara nere i minst "minutesDownBeforeRestart".
//   2) Efter en omstart pausas kontrollerna i "bootGraceMinutes"
//      så routern hinner starta och koppla upp igen.
//   3) Max "maxRestarts" omstarter i rad – därefter slutar den
//      (troligen fel hos operatören, inte routern). Räknaren
//      nollställs så fort internet kommer tillbaka.
//
//  Installeras i Shelly-appen/webbgränssnittet under
//  Scripts -> Add script -> klistra in -> Save -> Start.
//  Kräver en Shelly med skriptstöd: Plug S Gen3 / Plus Plug S
//  eller Plug M (Gen3). Routern kopplas in i Shelly-pluggen.
// ============================================================

let CONFIG = {
  switchId: 0,                                          // Plug S/M har en switch = id 0
  checkUrl: "http://clients3.google.com/generate_204",  // svarar HTTP 204 när nätet funkar
  checkEverySec: 60,                                    // hur ofta internet kollas
  minutesDownBeforeRestart: 5,                          // hur länge nätet måste vara nere
  powerOffSec: 20,                                      // hur länge strömmen bryts
  bootGraceMinutes: 5,                                  // paus efter omstart (router bootar)
  maxRestarts: 3,                                       // max omstarter i rad innan den ger upp
  httpTimeoutSec: 8,
};

let failsNeeded = Math.ceil(CONFIG.minutesDownBeforeRestart * 60 / CONFIG.checkEverySec);
let graceChecks = Math.ceil(CONFIG.bootGraceMinutes * 60 / CONFIG.checkEverySec);

let failCount = 0;
let restartCount = 0;
let graceLeft = 0;
let busy = false;

function log(msg) { print("[router-vakt] " + msg); }

function powerCycle() {
  busy = true;
  log("Bryter strömmen i " + CONFIG.powerOffSec + " s ...");
  Shelly.call("Switch.Set", { id: CONFIG.switchId, on: false }, function () {
    Timer.set(CONFIG.powerOffSec * 1000, false, function () {
      Shelly.call("Switch.Set", { id: CONFIG.switchId, on: true }, function () {
        log("Ström på igen. Väntar " + CONFIG.bootGraceMinutes + " min på att routern startar.");
        graceLeft = graceChecks;
        failCount = 0;
        busy = false;
      });
    });
  });
}

function onCheck(result, errCode) {
  let online = (errCode === 0 && result && result.code >= 200 && result.code < 400);
  if (online) {
    if (failCount > 0 || restartCount > 0) log("Internet OK igen – nollställer.");
    failCount = 0;
    restartCount = 0;
    return;
  }
  failCount++;
  log("Internet nere (" + failCount + "/" + failsNeeded + " kontroller).");
  if (failCount < failsNeeded) return;

  if (restartCount >= CONFIG.maxRestarts) {
    log("Max antal omstarter (" + CONFIG.maxRestarts + ") nått. Startar INTE om igen – troligen operatörsfel. Väntar på att nätet ska återkomma.");
    return;
  }
  restartCount++;
  log("Startar om routern (försök " + restartCount + "/" + CONFIG.maxRestarts + ").");
  powerCycle();
}

function tick() {
  if (busy) return;
  if (graceLeft > 0) { graceLeft--; log("Boot-paus, " + graceLeft + " kontroller kvar."); return; }
  Shelly.call("HTTP.GET", { url: CONFIG.checkUrl, timeout: CONFIG.httpTimeoutSec }, onCheck);
}

log("Startad. Kollar var " + CONFIG.checkEverySec + " s, startar om efter " +
    CONFIG.minutesDownBeforeRestart + " min nere, max " + CONFIG.maxRestarts + " omstarter.");
Timer.set(CONFIG.checkEverySec * 1000, true, tick);
