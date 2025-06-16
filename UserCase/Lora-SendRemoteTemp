// This script continuously fetches temperature data from a Shelly device every minute,
// parses the JSON response, and then sends the temperature value via LoRaWAN.
// It includes error handling for HTTP request failures and JSON parsing errors.
//
// IMPORTANT: You need to update the following:
// - **IP address**: Change "192.168.1.14" to the actual IP address of your Shelly device.
// - **LoRa ID**: Update "1843" to your desired LoRa application or device ID.

print("Starting!");

Timer.set(60000, true, function () {
  let meas_url = "http://192.168.1.14/rpc/Shelly.GetStatus"; // Update with your Shelly's IP address
  Shelly.call("HTTP.GET", { url: meas_url }, function (res, error_code, error_message) {
    if (error_code === 0 && res.code === 200) {
      try {
        let data = JSON.parse(res.body);
        let temp = data["temperature:100"].tC;
        let payload = JSON.stringify({ temperature: temp });
        Shelly.call('Lora.SendBytes', {id:1843, data:btoa(payload)}); // Update with your LoRa ID
        print("LoRa sent temperature:", temp);
      } catch (e) {
        print("Error parsing response:", e.message);
      }
    } else {
      print("Failed to fetch temperature. HTTP code:", res.code, "Error:", error_message);
    }
  });
});
