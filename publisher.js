var mqtt = require('mqtt');
var deviceId = "5e1298d5a3c68a2e4c1e8607";
// var client  = mqtt.connect('ws://52.163.202.13/mqtt/');
var client  = mqtt.connect('mqtt://localhost:1883',{will: {
	topic: 'connectionDevice/5e1298d5a3c68a2e4c1e8607',
	payload: '0',
	qos: 1,
	retain: true
}});
client.on('connect', function (err) {
	console.log(err);
	console.log("Connected to Broker");
	client.publish('connectionDevice/5e1298d5a3c68a2e4c1e8607','1');
	client.subscribe("configurationDevice/5e1298d5a3c68a2e4c1e8607/request");
    setInterval(function() {
    client.publish('fireValue/5e1298d5a3c68a2e4c1e8607', '0');
    }, 5000);
});

client.on('disconnect',function(err){
	console.log(err);
	console.log("Disconnected to Broker");
	client.publish('connectionDevice/5e1298d5a3c68a2e4c1e8607','0');
});

client.on('message',function(topic,message){
	message = message.toString();
	let splitTopic = topic.split("/");
	if(splitTopic[0]==="configurationDevice"){
		if(splitTopic[2]==="request"){
			if(message==="1"){
				client.publish("configurationDevice/5e1298d5a3c68a2e4c1e8607/coordinate","21.027:105.83");
			}
		}
	}
});