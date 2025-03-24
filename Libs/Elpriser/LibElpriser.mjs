/* This is a library that check elpriser i Sverige via tjänsten Qtrl.me 
   https://github.com/StyraHem/ShellyScriptExempel/tree/main 
   Developed by StyraHem.se
 */
function setSwitch(cfg, on) {
  if (cfg.switchId != undefined &&  on != undefined )
    Shelly.call("Switch.Set", {id:cfg.switchId, on: on});  
}
function checkElpris(cfg) 
{    
  Shelly.call(
    "HTTP.GET",
    {url: "http://qtrl.me/api/price/" + cfg.region + "?token=" + cfg.token},
    function(result, error_code, error_message) {
             if (error_code != 0) {
        setSwitch(cfg, cfg.errorState);
        print("ReqError:", error_message);
      } else if (result.code != 200) {
        setSwitch(cfg, cfg.errorState);        
        print("HttpError", result.message);      
      } else {
        let on, price =parseFloat(result.body);
        if (isNaN(price)) {
          setSwitch(cfg, cfg.errorState);        
          print("RespError", result.body);
          return;
        }
        if (cfg.price) {
          on = (price < cfg.price);
          if (cfg.revert)
            on = !on;
          setSwitch(cfg, on);
        }
        print("Pris=", price, "State=", on);
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
  cfg.interval = Math.max(60, cfg.interval || 0);
  print("Start check elpris with interval " , cfg.interval, "s");
  timer = Timer.set(cfg.interval * 1000, true, function() {
    checkElpris(cfg);
  });
}
Shelly.addEventHandler(function(event) {
  if (event.info.event=="startCheckElpris") 
    startCheckElpris(event.info.data);
});
