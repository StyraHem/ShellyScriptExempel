/*
This script set the state of a Shelly depending on the electrical price in Sweden.
Need a account on qtrl.me to get the prices

Skriptet används för att ändra läget på utgången på en shelly beroende på elpriset i sverige.
Behöver ett konto på qtrl.me för att hämta elpriserna. Den kan styra beroende på nuvarande 
eller nästa timmes pris eller beroende på de dyraste eller billigaste timmarna. 
*/
const cfg = 
{
  region : "",  //Region se1, se2, se3, se4
  token : "",  //Token from https://qtrl.me
  interval: 5,  //Interval, min 60s
}

function gotElpris(data)
{  
  const state = (data.price < 0.5);      //On when price below 0.5
  //const state = (data.day_order < 20);  //On except for 4 highest prices
  //const state = (data.price < data.next_price)  //On when next price is more than current
  const switchId = 0;   //Change status of switch nr 0=first 1=2:nd
  
  //Set state
  Shelly.call("Switch.Set", {id:switchId, on:state});  
}



/* DON'T CHANGE BELOW */

function checkElpris() 
{    
  Shelly.call(
    "HTTP.GET",
    {url: "http://qtrl.me/api/info/" + cfg.region + "?token=" + cfg.token},
    function(result, error_code, error_message) {
      if (error_code != 0) {
        print("Error", error_message);
      } else {
        const data = JSON.parse(result.body);
        print("Data=", data);
        gotElpris(data);
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
