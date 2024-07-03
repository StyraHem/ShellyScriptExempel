/* This is a library that check elpriser i Sverige via tjänsten Qtrl.me 
   https://github.com/StyraHem/ShellyScriptExempel/tree/main 
   Developed by StyraHem.se
 */
function checkElpris(cfg) 
{    
  Shelly.call(
    "HTTP.GET",
    {url: "http://qtrl.me/api/price/" + cfg.region + "?token=" + cfg.token + "&src=QtrlMeLibElpriser1"},
    function(result, error_code, error_message) {
      if (error_code != 0) {
        print("Error", error_message);
      } else {
        let on, price = result.body;
        if (cfg.price)
          on = price > cfg.price;
        print("Pris=", price, "State=", on);
        if (cfg.switchId != undefined)
          Shelly.call("Switch.Set", {id:cfg.switchId, on: on});
        Shelly.emitEvent("checkElpris", {on:on, price:price});
      }
    }
  );
}

function checkparam(cfg, name) {
  if (!cfg[name]) { print("Parameter " + name + " missing"); return true; }
}

function startCheckElpris(cfg) 
{
  cfg = cfg || {};
  if (
    checkparam(cfg, "region") ||
    checkparam(cfg, "token")
  ) { return; }
  cfg.interval = cfg.interval || 60;  
  print("Start check elpris with interval " , cfg.interval, "s");
  timer = Timer.set(cfg.interval * 1000, true, function() {
    checkElpris(cfg);
  });
}

Shelly.addEventHandler(function(event) {
  if (event.info.event=="startCheckElpris") 
    startCheckElpris(event.info.data);
});
