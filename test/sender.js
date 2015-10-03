var mqtt = require('mqtt');

var data ='1';

var client = mqtt.connect('mqtt://test.mosquitto.org'); 
client.subscribe('aquafeed-send-desktop');
client.publish('aquafeed-send-desktop', data);