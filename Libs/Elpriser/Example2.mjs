Shelly.emitEvent(
  "startCheckElpris", 
  {
    region : "se3",  //Region se1, se2, se3, se4
    token : "xxxxxxxxxxxxxxxxxxxxxxxx",  //Token from https://qtrl.me
    interval: 600,  //Interval, min 60s
  }
);
