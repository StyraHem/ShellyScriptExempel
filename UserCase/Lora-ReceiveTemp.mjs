// This script listens for incoming LoRa messages, parses them as JSON,
// extracts a 'temperature' value, and then updates a virtual temperature sensor
// on the Shelly device with this value. It includes error handling for invalid
// or unparseable LoRa data, and now also checks for a specific 'loraId' within the payload.
//
// IMPORTANT:
// - If your virtual temperature sensor has a different ID,
//   you'll need to update "200" to match its correct ID.
// - The 'expectedLoraId' (e.g., 1843) should match the 'id' you are sending
//   from your transmitting device to ensure the correct messages are processed.

Shelly.addEventHandler(function (event, data) {
  if (
    typeof event !== 'object' ||
    event.name !== 'lora' ||
    !event.info ||
    !event.info.data
  ) {
    return;
  }

  let expectedLoraId = 1843; 

  try {
    let msg = JSON.parse(atob(event.info.data));

    if (msg.id !== expectedLoraId) {
      print("Received LoRa message with unexpected ID:", msg.id, ". Expected:", expectedLoraId);
      return; 
    }

    let temp = msg.temperature;

    Shelly.call("Number.Set", {
      id: 200, 
      value: temp  
    });

    print("Updated virtual temp:", temp);
  } catch (e) {
    print("Error parsing LoRa data or missing expected fields:", event.info.data, "Error:", e.message);
  }
});
