let mqtt = require('mqtt');
let deviceId = "fc20d287-0340-49af-983c-decd4d040f3d";
let deviceLocation = "Tòa C3C khu đô thị B";
let deviceHotline = "0123456789";
let deviceLat = "21.027";
let deviceLon = "105.83";

// var client  = mqtt.connect('ws://52.163.202.13/mqtt/');
var client  = mqtt.connect('mqtt://localhost:1883',{will: {
	topic: 'connectionDevice/' + deviceId,
	payload: '0',
	qos: 1,
	retain: true
}});
// var client  = mqtt.connect('mqtt://localhost:1883',{will: {
// 	topic: 'connectionDevice/' + deviceId,
// 	payload: '0',
// 	qos: 1,
// 	retain: true
// }});
client.on('connect', function (err) {
	console.log(err);
	console.log("Connected to Broker");
	client.publish('connectionDevice/' + deviceId,'1:'+deviceLocation+":"+deviceLat+":"+deviceLon+":"+deviceHotline);
	client.subscribe("configurationDevice/" + deviceId + "/request");
    setInterval(function() {
	let value = getRandomInt(3);
	let time = Date.now();
    client.publish('fireValue/' + deviceId, time+"_"+value);
    }, 5000);
});

client.on('disconnect',function(err){
	console.log(err);
	console.log("Disconnected to Broker");
	client.publish('connectionDevice/' + deviceId,'0');
});

client.on('message',function(topic,message){
	message = message.toString();
	let splitTopic = topic.split("/");
	if(splitTopic[0]==="configurationDevice"){
		if(splitTopic[2]==="request"){
			if(message==="1"){
				client.publish("configurationDevice/" + deviceId + "/coordinate","21.027:105.83");
			}
		}
	}
});

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }