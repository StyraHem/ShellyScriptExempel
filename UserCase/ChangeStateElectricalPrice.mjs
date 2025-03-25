/*
This script set the state of a Shelly depending on the electrical price in Sweden.
Need a account on qtrl.me to get the prices

Skriptet används för att ändra läget på utgången på en shelly beroende på elpriset i sverige.
Behöver ett konto på qtrl.me för att hämta elpriserna. Den kan styra beroende på nuvarande 
eller nästa timmes pris eller beroende på de dyraste eller billigaste timmarna. 

Developed by: StyraHem.se
*/
const cfg = 
{
  region : "",  //Region se1, se2, se3, se4
  token : "",  //Token from https://qtrl.me
  interval: 60,  //Interval, min 60s
}

const switchId = 0;   //Change status of switch nr 0=first 1=2:nd

function gotElpris(data)
{  
  const state = (data.price < 0.5);      //On when price below 0.5
  //const state = (data.day_order < 20);  //On except for 4 highest prices
  //const state = (data.price < data.next_price)  //On when next price is more than current

  //Set state
  Shelly.call("Switch.Set", {id:switchId, on:state});  
}

function error(type, msg) {
  //Type: 1 - Cant connect to qtrl.me, 2 - Server error, 3 - Wrong response from server
  Shelly.call("Switch.Set", {id:switchId, on:true});  //Turn on the output when error 
}

/* DON'T CHANGE BELOW */

function checkElpris() 
{    
  Shelly.call(
    "HTTP.GET",
    {url: "http://qtrl.me/api/info/" + cfg.region + "?token=" + cfg.token},
    function(result, error_code, error_message) {
      try {
        if (error_code != 0) {
          error(1, error_message);
          print("ReqError:", error_message);
        } else if (result.code != 200) {
          error(2, error_message);
          print("HttpError", result.message);      
        } else {
          const data = JSON.parse(result.body);
          print("Data=", data);
          if (data.price===undefined) {
            error(3, "Invalid JSON response, " + result.body);
            print("DataError", "Invalid JSON response");      
          } else {        
            gotElpris(data);        
          }
        }
      } catch (e) {
        error(4, e.message);
      }
    }
  );
}

function checkparam(cfg, name) {
  if (!cfg[name]) { print("Parameter " + name + " missing"); return true; }
}

if (
  !checkparam(cfg, "region") &&
  !checkparam(cfg, "token")
) {
  print("Start check elpris with interval " , cfg.interval, "s");
  timer = Timer.set(cfg.interval * 1000, true, function() {
    checkElpris();
  });
}
