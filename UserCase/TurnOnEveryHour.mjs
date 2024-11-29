/* This script tur on a device every hour */

function statusGet(id, callback){Shelly.call("Switch.GetStatus",{"id":id},function(r){callback(r.output)});}
function statusSet(id, val){Shelly.call("Switch.Set",{"id":id, "on":val});}
function getVal(){(new Date()).getHours();}

let lastVal = getVal();

function checkTime()
{
  print("Check time");
  var val = getVal();
  if (val != lastVal) {
    print("Turn on");
    statusSet(0 , 1);
    lastVal = val;
  }
}

print("Starting");
Timer.set(1000, true, checkTime);
