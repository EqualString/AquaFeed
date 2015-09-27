var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://test.mosquitto.org'); 
client.subscribe('aquafeed');
client.publish('aquafeed', 'odradio');