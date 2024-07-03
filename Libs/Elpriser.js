/*
This is a library that check elpriser i Sverige via tjänsten Qtrl.me
*/

function checkElpris(token) 
{
  Shelly.call(
  "HTTP.GET",
  {url: "http://qtrl.me/api/price/" + region + "?token=" + token},
  function(result, error_code, error_message) {
    if (error_code != 0) {
      print("Error", error_message);
    } else {
      let price = result.body;
      let on = (price > 0.4);
      print("Pris=", price, "State=", on);
      Shelly.call("Switch.Set", {id:0, on: on});
    }
  });
}

function startCheckElpris(cfg) 
{
  timer = Timer.set(5000, true, check);
}

