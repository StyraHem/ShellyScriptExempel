/**
 * This is a script that can be used in Google Shhets to fetch consumption data from a Shelly  and combined with 
 * price information in sweden.
 *
 * Autor: This scriped is created by StyraHem, Sweden
 *
 * Devices:
 * - Shelly 3EM
 * - Shelly Pro 3EM
 * - Shelly Plus/G3 PM devices
 
 * Steps:
 * 1. Get the current hour
 * 3. Fetch and parse device status from Shelly API.
 * 4. Fetch current electricity price.
 * 5. Log total consumption and price.
 * 
 * Variables:
 * - 'SHELLY_SERVER': Shelly server
 * - `SHELLY_AUTH_KEY`: Shelly API key.
 * - `SHELLY_DEVICE_ID`: Shelly device ID.
 * - `QTRLME_TOKEN`: Token for fetching electricity prices.
 * - 'PRICE_ZONE': Price zone; SE1, SE2, SE3, SE4 (only sweden supported for now)
 */

//Shelly settings from Shelly app or https://control.shelly.cloud
const SHELLY_SERVER = 'shelly-XXXX.shelly.cloud'; //SERVER AND AUTH_KEY found under account settings
const SHELLY_AUTH_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const SHELLY_DEVICE_ID = 'XXXXXXXXXXXX'  //Shelly device ID (hex version) that you found under device settings

//Token from Qtrl.me account from https://qtrl.me
const QTRLME_TOKEN = 'XXXXXXX';

//What price zone to ues; SE1, SE2, SE3, SE4 (only sweden)
const PRICE_ZONE = 'SE3'

//Find energy given bu aenergy object, for like Shelly PM devices
function getEnergy(data) {
  for (const key in data) {
    if (typeof data[key] === 'object' && data[key] !== null) {
      if (data[key].aenergy && data[key].aenergy.total) {
        return data[key].aenergy.total;
      } else {
          const result = getEnergy(data[key]);
          if(result){
            return result;
          }
      }
    }
  }
  return null; 
}

function fetchShellyData() {
  
  //Get date on hour level, by set min, sec to zero.
  const now = new Date();
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  //Fetch Shelly server
  const URL = 'https://' + SHELLY_SERVER + '/device/status?id=' + SHELLY_DEVICE_ID + '&auth_key=' + SHELLY_AUTH_KEY;
  const response = UrlFetchApp.fetch(URL);
  const data = JSON.parse(response.getContentText());

  //Get total consumption for all phases
  let totalSum = null;
  if ('emeter' in data.data.device_status) {
    //3EM
    const totals = data.data.device_status.emeters.map(emeter => emeter.total);
    totalSum = totals.reduce((acc, value) => acc + value, 0);
  } else if ('emdata:0' in data.data.device_status) {
    //Pro 3EM
    totalSum = data.data.device_status['emdata:0'].total_act;
  } else {
    //Shelly PM devices
    totalSum = getEnergy(data);
  }
 
  if (totalSum === null) {
    Logger.log("Can't find total energy from server");
    Logger.log(data.data.device_status)
  }

  const price = parseFloat(UrlFetchApp.fetch('https://qtrl.me/api/price/' + PRICE_ZONE + '?token=' + QTRLME_TOKEN))

  //Get first sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; 

  //Find last log row
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var lastDate = sheet.getRange(lastRow, 1).getValue();
 
  Logger.log("Total=%d Price=%d", totalSum, price);

  //Check if next our or update current
  if (lastDate>=now) {
    sheet.getRange(lastRow, 2).setValue(totalSum);
  } else {
    sheet.appendRow([now, totalSum, price]);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat("yyyy-MM-dd HH:mm");
  }
}
