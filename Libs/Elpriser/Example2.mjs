Shelly.addEventHandler(function(event) {
  if (event.info.event=="checkElpris") {
    let data = event.info.data;
    let on = data.on; 
    let price = data.price; 

    //Do what you want with the on or price values....
  }
});

Shelly.emitEvent(
  "startCheckElpris", 
  {
    region : "se3",  //Region se1, se2, se3, se4
    token : "xxxxxxxxxxxxxxxxxxxxxxxx",  //Token from https://qtrl.me
    interval: 600,  //Interval, min 60s
  }
);
