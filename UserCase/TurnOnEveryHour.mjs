/* This script tur on a device every hour */

function statusGet(id, callback){Shelly.call("Switch.GetStatus",{"id":id},function(r){callback(r.output)});}
function statusSet(id, val){Shelly.call("Switch.Set",{"id":id, "on":val});}
function getVal(){(new Date()).getHours();}

let lastVal = getVal();

function checkTime()
{
  Logger.log("Check time");
  var val = getVal();
  if (val != lastVal) {
    Logger.log("Turn on");
    statusSet(0 , 1);
    lastVal = val;
  }
}

Logger.log("Starting");
Timer.set(60000, true, checkTime);
