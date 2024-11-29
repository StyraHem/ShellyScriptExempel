/* This script tur on a device every hour '/

function statusGet(id, callback){Shelly.call("Switch.GetStatus",{"id":id},function(r){callback(r.output)});}
function statusSet(id, val){Shelly.call("Switch.Set",{"id":id, "on":val});}
function getVal(){(new date()).getHours();}

let lastVal = getVal();

function checkTime()
{
  var val = getVal();
  if (val != lastVal) {
    statusSet(0 , 1);
    lastVal = val;
  }
}

Timer.set(60000, true, checkTime);
