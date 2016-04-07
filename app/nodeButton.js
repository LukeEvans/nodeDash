var request = require('request'),
	hue = require("node-hue-api"),
	dash_button = require('node-dash-button'),
        Wemo = require('wemo-client'),
	moment = require('moment');

var wemo = new Wemo();
var wemoSwitch;


var HueApi = hue.HueApi,
    hueIp = '192.168.0.33',
    hueUsername = '1f58464c110b3a8f2166a22437630227',
    lightState = hue.lightState,
    api = new HueApi(hueIp, hueUsername)

var dashes = {
	cottonelle: "a0:02:dc:b6:15:18",
	bounty: "74:c2:46:df:12:67",
	larabar: "74:c2:46:13:93:e3",
	gillette: "74:c2:46:d8:b1:0d",
	ziploc:	"a0:02:dc:08:12:53"
};

var lights = {
	kendra: 1,
	luke: 2,
	living_room: 3,
	bedroom: 4
};

var ledgeSwitch = {
	"name": "Ledge"
}

var macs = dash_button([
  dashes.cottonelle,
  dashes.bounty, 
  dashes.larabar,
  dashes.gillette,
  dashes.ziploc
]); //address from step above

console.log("------------- Started nodeButton ----------------");
console.log("++ Detecting Wemo Switches ++");

wemo.discover(function(deviceInfo) {
      if (deviceInfo && deviceInfo.friendlyName === ledgeSwitch.name) {
      		console.log('Found switch: ' + ledgeSwitch.name);
        	ledgeSwitch.wemoClient = wemo.client(deviceInfo);
      }

});

macs.on("detected", function (dash_id){
    if (dash_id === dashes.cottonelle){
        console.log("{{ Cottonelle Pressed }}");
        toggle_wemoswitch(ledgeSwitch);
    } else if (dash_id === dashes.bounty){
        console.log("{{ Bounty Pressed }}");
        toggle_light(lights.luke);
    } else if (dash_id === dashes.larabar) {
    	console.log("{{ Larabar Pressed }}");
	toggle_light(lights.kendra);
    } else if (dash_id === dashes.gillette) {
	console.log("{{ Gillette Pressed }}");
	toggle_light(lights.bedroom);
    } else if (dash_id === dashes.ziploc) {
	console.log("{{ Ziploc Pressed }}");
	toggle_light(lights.living_room);
    } else {
	console.log(dash_id);
    }
});

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

var displayError = function(err) {
    console.error(err);
};

function getRoughTime (m) {
	var g = null; //return g
	
	console.log(m.format())
	if(!m || !m.isValid()) { return; } //if we can't find a valid or filled moment, we return.
	
	var split_afternoon = 12 
	var split_evening = 16 
	var split_bed = 22
	var split_twilight = 4
	var currentHour = parseFloat(m.format("HH"));

	console.log("currentHour: ");
	console.log(currentHour)

	if(currentHour >= split_afternoon && currentHour <= split_evening) {
		g = "afternoon";
	} else if(currentHour >= split_evening && currentHour <= split_bed) {
		g = "evening";
	} else if (currentHour >= split_bed || currentHour <= split_twilight) {
		g = "bed";
	}
	else {
		g = "morning";
	}
	
	console.log("Rough Time: " + g);
	return g;
}

function getOnLightState(roughTime) {
	state = lightState.create().on(true);
	if (roughTime === "morning") { state.brightness(100); } 
	else if (roughTime === "afternoon") { state.brightness(100); } 
	else if (roughTime === "evening") { state.brightness(100); } 
	else { state.brightness(10); }

	return state;
}

function toggle_light(lightId) {
	console.log('Triggering Event for light: ' + lightId);

	state = lightState.create();

	api.lightStatus(lightId, function(err, result) {
    	if (err) throw err;
 		var roughTime = getRoughTime(moment());

    	if (result && result.state && !result.state.on) {
    		console.log(result.state);
    		console.log('Turning on light: ' + lightId);
    		state = getOnLightState(roughTime);
    	} else {
    		console.log('Turning off light: ' + lightId);
		state = state.off();
    		
    	}

    	api.setLightState(lightId, state)
    		.then(displayResult)
    		.fail(displayError)
    		.done();
	});
};

function set_light_state(lightId, brightness) {
	api.setLightState(lightId, brightness)
		.then(displayResult)
		.fail(displayError)
		.done();
};

function toggle_wemoswitch(wemoSwitch) {
	console.log('Triggering Event for switch: ' + wemoSwitch.name);
	
	wemoSwitch.wemoClient.getBinaryState(function(err, state) {
		if (err != null) console.err(err);
		else {
			var newState = state ^= 1;
			wemoSwitch.wemoClient.setBinaryState(newState);

		};
	});
};
