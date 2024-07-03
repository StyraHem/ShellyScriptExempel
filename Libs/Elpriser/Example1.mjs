/* This require LibElprices.mjs to be installed and running */

Shelly.emitEvent(
  "startCheckElpris", 
  {
    region : "se3",  //Region se1, se2, se3, se4
    token : "xxxxxxxxxxxxxxxxxxxxxxxx",  //Token from https://qtrl.me
    price: 0.4,  //Price when turn on when over (use revert to on when under)
    revert: false, //[Optinal] Set to tru to turn on when price under
    interval: 600,  //Interval, min 60s
    switchId: 0,  //[Optional] Id of internal switch to control
  }
);
