/* This script utilizes a Shelly Plus/Pro 2/2PM with a siren connected to channel 0 (alarmId).
  Channel 1 is used to trigger the siren. Upon activation the siren will switch on and off repeatedly
  for the first 20 seconds at one-second intervals. After the initial 20 seconds the siren will continuously
  sound until the trigger signal ceases '/

let triggerId = 1;
let alarmId = 0;

function statusGet(id, callback){Shelly.call("Switch.GetStatus",{"id":id},function(r){callback(r.output)});}
function statusSet(id, val){Shelly.call("Switch.Set",{"id":id, "on":val});}

let alarmOnCnt = 0;

function checkAlarm()
{
  statusGet(triggerId, function(result) {
    if (result) {
      alarmOnCnt++;
      if (alarmOnCnt <= 20) {
         statusSet(alarmId , alarmOnCnt % 2 == 0);
      } else {
        statusSet(alarmId , true);
      }
    } else {
      alarmOnCnt = 0
      statusSet(alarmId, false);
    }
  });  
}

Timer.set(1000, true, checkAlarm);
