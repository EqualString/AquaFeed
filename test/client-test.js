var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://test.mosquitto.org'); 
client.subscribe('aquafeed');
client.on('message', function (topic, message) {
	
	pali();
	//console.log(message.toString());
	client.end();
	
});
function pali(){
	
	console.log("vrti!");
	
}