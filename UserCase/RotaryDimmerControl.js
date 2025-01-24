/**
 * This script is used to read the voltage from a rotary dimmer connected via a Shelly Plus Addon 
 * and control the brightness of a dimmer connected to the Shelly device's output.
 *
 * Functionality:
 * - The rotary dimmer's analog output is connected to the Addon's analog input.
 * - When a voltage change is detected, the value is multiplied by 10 
 *   (to match the dimmer's brightness scale of 0–100) and sent to the output dimmer.
 *
 * Requirements:
 * - A Shelly Plus device with an Addon installed.
 * - A rotary dimmer connected to the Addon's analog input.
 * - A light/fan connected to the Shelly device's output (controlled via "Light.Set").
 */

Shelly.addEventHandler(function (event) {
  const volt = event.info.voltage; // Read the voltage from the Addon's analog input
  print(volt); // Debug print of the analog value
  if (volt) {
    // Set the brightness based on the analog value
    const brightness = Math.round(volt * 10);
    Shelly.call("Light.Set", { id: 0, brightness: brightness });
  }
});
