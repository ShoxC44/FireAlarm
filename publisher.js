var mqtt = require('mqtt');
var deviceId = "5e13499b3595da0d87d57d7c";
// var client  = mqtt.connect('ws://52.163.202.13/mqtt/');
var client  = mqtt.connect('mqtt://202.191.58.47:1883',{will: {
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
	client.publish('connectionDevice/' + deviceId,'1');
	client.subscribe("configurationDevice/" + deviceId + "/request");
    setInterval(function() {
    client.publish('fireValue/' + deviceId, '0');
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