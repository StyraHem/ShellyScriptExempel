// Definiera unika ID för temperatursensorerna.
// Tak-sensorns ID.
const SENSOR_ID_TAK = 100;
// Tank-sensorns ID.
const SENSOR_ID_TANK = 101;

// Funktion för att läsa av temperaturerna från sensorerna.
function readTemperatures() {
 
    // Hämta temperaturen från taksensorn (taket).
    var tempTak = Shelly.getComponentStatus('Temperature', SENSOR_ID_TAK).tC;
    // Hämta temperaturen från tanksensorn (tanken).
    var tempTank = Shelly.getComponentStatus('Temperature', SENSOR_ID_TANK).tC;
    // Hämta "startdiff" (start-differensen) från en virtuell enhet med ID 200.
    var startDiffTemp =  Virtual.getHandle("number:200").getValue();
    // Hämta "maxtemp tank" (maximala temperaturen i tanken) från en virtuell enhet med ID 201.
    var maxTempTank=  Virtual.getHandle("number:201").getValue();
   
    // Kontrollera att båda temperaturvärdena är giltiga (inte null).
    if (tempTak !=null && tempTank !=null) {

      // Beräkna temperaturskillnaden mellan tak och tank.
      var diff = tempTak - tempTank;
      // Bestäm om brytaren ska vara på eller av baserat på två villkor.
      // 1. Temperaturskillnaden (`diff`) är större än den definierade startdifferensen (`startDiffTemp`).
      // 2. Tankens temperatur (`tempTank`) är lägre än den maximala tillåtna temperaturen (`maxTempTank`).
      var state = (diff > startDiffTemp) && (tempTank < maxTempTank);

      // Styr en Shelly-brytare (med ID 0) baserat på `state`-variabelns värde.
      // Om `state` är `true`, slås brytaren på. Om `false`, slås den av.
      Shelly.call("Switch.Set", { id: 0, on: state});
    }
}

// Ställ in en timer som kör funktionen `readTemperatures` varje minut (60000 millisekunder).
// `true` betyder att timern upprepas.
Timer.set(60000, true, function () { readTemperatures(); });

// Kör funktionen `readTemperatures` en gång direkt när skriptet startas.
readTemperatures();
