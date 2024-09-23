//Användarens inloggningsuppgifter till Shelly account
//User login to Shelly account
//Waiting and hoping Shelly will allow login using API token instead of user/password
const email = 'enter@email.here';
const password = 'enterYourpasswordhere';
let token = ""; //Leave empty, this is fetch in logon funktion

function loginToShelly() {
  Logger.log("loginToShelly");
  var hashedPassword = sha1Hash(password);
  var postData = 'email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(hashedPassword) + "&var=2";
  var options = {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: postData, 
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch('https://api2.shelly.cloud/auth/login', options);
  
  var jsonResponse = JSON.parse(response);
  if (jsonResponse.isok) {
    token = jsonResponse.data.token;  // Hämta token från svaret
  } else {
    Logger.log('Inloggning misslyckades: ' + JSON.stringify(jsonResponse.errors));
  }
}

function getShellyStatistics(id, date) {
  Logger.log("getShellyStatistics");
  var url = 'https://shelly-5-eu.shelly.cloud/statistics/relay/ext_temp_sensors?id=' + id + '&channel=0&date_range=day&date_from=2024-09-22%2013%3A00%3A00&date_to=' + encodeURIComponent(formatDate(date));
  var headers = {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json, text/plain, */*'
  };
  var options = {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseText = response.getContentText();
    var jsonResponse = JSON.parse(responseText);
    Logger.log('Parsed JSON response: ' + JSON.stringify(jsonResponse, null, 2));    
  } catch (e) {
    Logger.log('Fel vid anrop till Shelly API: ' + e.toString());
  }
}

function sha1Hash(input) {
  Logger.log("sha1Hash");
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, input);
  var hash = rawHash.map(function(byte) {
    // Konvertera varje byte till två hexadecimala tecken
    var hex = (byte + 256).toString(16).slice(-2);
    return hex;
  }).join('');
  return hash;
}

function formatDate(date) {
  Logger.log("formatDate");
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Månad är 0-indexerad
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function test() {
  Logger.log("run");
  loginToShelly();
  var date = new Date(2024, 8, 22, 0, 0, 0);
  getShellyStatistics('c45bbe6ad395', date);
}
