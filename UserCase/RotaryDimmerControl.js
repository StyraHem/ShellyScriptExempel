/**
 * This script reads the voltage from a potentiometer connected via a Shelly Plus Addon
 * and controls the brightness of a dimmer connected to the Shelly device's output.
 *
 * Functionality:
 * - The potentiometer's analog output is connected to the Addon's analog input.
 * - When a voltage change is detected, the value is converted to brightness (0–100 scale),
 *   and the dimmer's brightness is updated if the value has changed.
 *
 * Requirements:
 * - A Shelly Plus device with an Addon installed.
 * - A potentiometer connected to the Addon's analog input.
 * - A dimmer connected to the Shelly device's output (controlled via "Light.Set").
 */

// Variable to store the last brightness value
let lastBrightness = null;

Shelly.addEventHandler(function (event) {
  const volt = event.info.voltage; // Read the voltage from the Addon's analog input
  print("Voltage:", volt); // Debug print of the analog value

  if (volt) {
    // Convert voltage to brightness (0–100) and round to an integer
    const brightness = Math.round(volt * 10);

    // Only call Shelly API if the brightness value has changed
    if (lastBrightness === null || Math.abs(brightness - lastBrightness) > 1) {
      Shelly.call("Light.Set", { id: 0, brightness: brightness });
      lastBrightness = brightness;
    }
  }
});
