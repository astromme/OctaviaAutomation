var RPATH = "./route/";
var Route = require(RPATH).Route;

var MPATH = "./route/modules/";
var Web     = require(MPATH + "web").Web;

var route = new Route({debug:true});
var web = route.addDevice({
  type : Web, name : "Web",
  init : {
    port : 8000,
    dir : __dirname + "/web",
  },
});

var Hue = require(MPATH + "hue").Hue;
var hue = route.addDevice({
  type: Hue, name: "Hue",
  init: {
    host: "192.168.0.199",
    uuid: "001788fffe10218d",
  }
})

var Timer = require(MPATH + "timer").Timer;
var timerDevice = route.addDevice({
  type: Timer, name: "Timer",
  init: {

  }
});

// var Sonos = require(MPATH + "sonos").Sonos;
// var sonos = route.addDevice({
//   type: Sonos, name: "Sonos",
//   init: {
//     components: {"Main": "192.168.1.6"},
//   },
// });
//  console.log(params.message);
//});

var color_from_date = function(date) {
  var colors = [];
  colors[12+5] = 'white';
  colors[12+6] = 'lightgreen';
  colors[12+7] = 'lightblue';
  colors[12+8] = 'yellow';
  colors[12+9] = 'orange';
  colors[12+10] = 'orangered';
  colors[12+11] = 'red';
  colors[0] = 'black';

  var hour = (24 + date.getHours() - 7) % 24;
  console.log(hour);
  console.log(colors);
  console.log(colors[hour]);
  return colors[hour];
}


var set_hueset = function(command, params) {
    var date = new Date();
    var hour = (24 + date.getHours() - 7) % 24;
    if (hour < 16) {
      hue.exec('AllOff');
      return;
    }
    hue.exec('SetLightState', {
      on: 'true',
      color: color_from_date(new Date()),
      bulbName: 'Living Room',
    });
    hue.exec('SetLightState', {
      on: 'true',
      bri: 0.4,
      bulbName: 'Living Room',
    });

}

route.addEventMap({
  // Map to a single command
  'Web.PlayMusic': 'Sonos.Main.PlayPause',
  // Map to multiple commands
  'Web.WatchDVD': ['TV.On', 'TV.HDMI1'],
  'Web.LightOn': 'Hue.SetLightState?on=true&bri=$bri&color=$color&bulbName=$name',
  'Web.LightOff' : 'Hue.AllOff',
  'Web.HueSet' : set_hueset,
  'Timer.LightChange' : set_hueset,
  'Timer.LightOff' : 'Hue.AllOff',
  // Map to a custom function
  'Web.Foo': function(command, params) {
    console.log('Web.Foo called!')
  }
});

setDateTimeout = function(fn, d) {
  var t = d.getTime() - (new Date()).getTime();
  if (t > 0) return setTimeout(fn, t);
}

function setupEveningLights() {
  // recalculate tomorrow at midnight;
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(3);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  setDateTimeout(setupEveningLights, tomorrow);

  for (i=17; i<25; i++) {
    var hour = new Date();
    console.log(hour);
    //hour.setDate(hour.getDate()-1); // for testing when late in the day
    hour.setHours(i+7);
    hour.setMinutes(0);
    hour.setSeconds(0);
    timerDevice.setAlarmForDate(hour, "LightChange");
  }
}

setupEveningLights();
