//Set output depending on input or temperature
Timer.set(10000, true, function() {
  let input = Shelly.getComponentStatus("input", 0).state;
  let temp =  Shelly.getComponentStatus('Temperature', 101).tC;
  let state = input || temp < 2;
  Shelly.call("Switch.set", {'id': 0, 'on': state});
});
