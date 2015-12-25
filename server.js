/* 
|------------------------------------------|
| AquaFeed - IoT nodejs Server             |
|------------------------------------------|
| @author:  Egredžija Alen                 |
| @version: 2.3 (1.10.2015)                |
| @website: http://aquafeed.cleverapps.io  |
|------------------------------------------|
*/

// Dopunske 'require' skripte
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mqtt = require('mqtt');
var io = require('socket.io')(server);
var InfiniteLoop = require('infinite-loop');
var fs = require('fs');
var app = express();
var session = require('client-sessions');

// Dodatne varijable
var user =[],db_user =[], sem = true, semi = true, auth, log =[];
var izvedeni=[],d,e,dates=[],datus,ln,i,index,now,usdata,usdata2,database;
var client, client_listener, listen_desktop_auth, send_desktop;
var uri = 'mongodb://EqualString:UEBSAW11391@ds027479.mongolab.com:27479/aquafeed'; //Mongolab DB

// Admin user
var admin =[];
admin[0] = "EqualString";
admin[1] = "Luafr";

/** Konfiguracija servera **/

// Port aplikacije
// Openshift ima svoj env.port,heroku svoj npr..
// Clever Cloud koristi 8080 po defaultu
// var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

// Express konfiguracija
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');

app.use(session({
  cookieName: 'session',
  secret: 'GotYaBlueFishTank?',
  duration: 7 * 24 * 60 * 60 * 1000, //Week session
}));

/** Server rute **/

app.get('/', function(req, res){
	res.render('index.html', {
		username: user[0]
	});
});

app.get('/index-auth', auth_test, function(req, res){
	if (req.session.user){
		res.redirect('/');
	} else{
		res.redirect('/login-failed');
	}
});

app.get('/login-auth', auth_test, function(req, res){
	if (req.session.user){
		res.redirect('/timeline');
	}  else{
		res.redirect('/login-failed');
	}
});

app.get('/login', function(req, res){
  res.render('login.html');
});

app.get('/login-failed', function(req, res){
  res.render('login-failed.html');
});

app.get('/timeline', function(req, res){
	if (req.session.user){
		res.render('timeline.html', {
			username: user[0]
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/events', function(req, res){
	if (req.session.user){
		res.render('events.html', {
			username: user[0]
		});
	} else{
		res.redirect('/login');
  }
});

app.get('/email', function(req, res){
	if (req.session.user){
		res.render('email.html', {
			username: user[0]
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/errors', function(req, res){
	if (req.session.user){
		res.render('errors.html', {
			username: user[0]
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/log', function(req, res){
	if (req.session.user){
		res.render('log.html', {
			username: user[0]
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/user', function(req, res){
	if (req.session.user){
		res.render('user.html');
	} else{
		res.redirect('/login');
	}
});

app.get('/logout', function(req, res){	
  user = [];
  req.session.reset();
  res.redirect('/login');
});

app.get('/404', function(req, res){
  res.render('404.html');
});
	
//Redirektanje zbog sigurnosti
app.get('/index', function(req, res){
  res.redirect('/');
});
app.get('/index.html', function(req, res){
  res.redirect('/');
});
app.get('/events.html', function(req, res){
  res.redirect('/events');
});
app.get('/timeline.html', function(req, res){
  res.redirect('/timeline');
});
app.get('/email.html', function(req, res){
  res.redirect('/email');
});
app.get('/errors.html', function(req, res){
  res.redirect('/errors');
});
app.get('/log.html', function(req, res){
  res.redirect('/log');
});
app.get('/user.html', function(req, res){
  res.redirect('/user');
});
app.get('/login.html', function(req, res){
  res.redirect('/login');
});
app.get('/404.html', function(req, res){
  res.redirect('/404');
});

//Konfiguracija servera
var server = app.listen(server_port, function () {
  //Spajanje na bazu
  MongoClient.connect(uri, function(err,db) {
	database = db;
	assert.equal(null, err);
	console.log('Spojen na bazu -> [Mongolab]');
	var host = server.address().address;
	var port = server.address().port;
	console.log('app @ :http://localhost:8080/');
  });	
});

app.use(express.static(__dirname + '/public'));//Koristi sve iz folder 'public'

//Stranica 404
app.use(function(req, res) {
    res.redirect('/404');
});

/** Server akcije **/
//Socket.io 
//Korištenje socketa za real-time komunikaciju client-server dijela
var io = require('socket.io')(server);
io.on('connection', function(socket){
	//Slanje
	socket.emit( 'datumi', dates ); //Emitiranje vrijednosti iz tablice
	socket.emit( 'izvoz', izvedeni ); //Emitiranje flagova
	socket.emit( 'log', log ); //Emitiranje zapisnika
	socket.emit( 'user_credentials', user ); //Emitiranje zapisnika

	//Primanje login informacija
	socket.on('login_info', function(infos){
		user[0] = infos[0];
		user[1] = infos[1];
	});
	
	//Izmjena računa/lozinke
	socket.on('change_user', function(infodata){
		//Chainano zbog redoslijeda operacija 1.brisanje, 2.ubacivanje
		database.collection('user').deleteMany( {}, function() {
			database.collection('user').insertOne( {
				"name" : infodata[0],
				"pass" : infodata[1],
			}, function(err, result) {
				assert.equal(err, null);
				user = infodata; //Novi user[] 
				var sada = getLogDate();
				log.push(sada+' - Promjena korisničkog imena/lozinke'); //Dodavanje u log 
			});
		});
	});
	
	//Izmjena vrijednosti u bazi vrijednostima iz tablice
	socket.on('table_data', function(data){
		ln = data.length;
		dates = [];//Resetiranje dates polja
		//Stvaranje JSON objekta, http://stackoverflow.com/questions/6979092/create-json-string-from-javascript-for-loop 
		var new_table_data = "[{";
		for (i = 0; i< ln; i++){
			izvedeni[i] = false; //Resetiranje flag-ova radi novih vrijednosti (eventualnih)
			new_table_data += '"'+i+'":"'+data[i]+'",';
			dates[i] = data[i];//Nove vrijednosti
		}
		new_table_data = new_table_data.slice(0, -1);
		new_table_data += "}]";
		//Novi zapis u bazi
		database.collection('dates').deleteMany( {}, function() {
			database.collection('dates').insert(JSON.parse(new_table_data));
			var sada = getLogDate();
			log.push(sada+' - Promjena vrijednosti u tablici'); //Dodavanje u log
		});
			
	});
	
	//Trenutno hranjenje
	socket.on('nowfeed', function(){
		client = mqtt.connect('mqtt://test.mosquitto.org');  //Free Broker
		client.subscribe('aquafeed');
		client.publish('aquafeed', 'feed');
		//console.log("Poslah sada");
		var sada = getLogDate();
		log.push(sada+' - Poslan zahtjev'); //Dodavanje u log da je poslan zahtjev
		client.end();
	});
	
});

/** Beskonačna petlja **/
//Beskonačna petlja servera za slanje
//Svake minute također osvježi i dates polje
var il = new InfiniteLoop;
function loop() {
        
		//Init listener-a
		listen_desktop_auth = mqtt.connect('mqtt://test.mosquitto.org');
		listen_desktop_auth.subscribe('aquafeed-desktop');
		
		client_listener = mqtt.connect('mqtt://test.mosquitto.org');
		client_listener.subscribe('aquafeed-arduino');
		
		//var dates = get_dates();
		get_table_dates(database, function(){
			//Slaganje dates polja
			dates = [];//Reset
			i = 0;
			do
			{   
				index = ""+i+"";
				dates[i] = usdata[index];
				i++;
			}
			while( usdata[index] != undefined );//Dok su vrijednosti iz baze definirane
			dates.pop();//Brisanje zadnjeg elementa
			now = getNow();
			var test_sun = new Date();
			var sun = test_sun.getDay().toString(); //Dohvaćanje dana u tjednu, 0-ned,1-pon..
			ln = dates.length;
			for (i = 0; i < ln; i++){
				if (dates[i] == now){
					client = mqtt.connect('mqtt://test.mosquitto.org');  //Free Broker
					client.subscribe('aquafeed');
					client.publish('aquafeed', 'feed');//Slanje Arduinu
					console.log("Poslah u "+dates[i]);
					izvedeni[i] = true; //Flag da je izvedeno hranjenje
					var sada = getLogDate();
					log.push(sada+' - Poslan zahtjev'); //Dodavanje u log da je poslan zahtjev
					io.emit('jesam',izvedeni);
					io.emit('real_log',log);
					client.end();
				}
			}
			
			//Resetiranje flagova izvedenih svakih 24-sata
			if (now == "00:00"){
				for (i = 0; i< ln; i++){
					izvedeni[i] = false;
				}
			}
			//Resetiranje loga svake nedjelje u 1:00 
			if ((now == "01:00")&&(sun == "0")){
				log = [];
			}
		});
	
}
il.add(loop,[]).setInterval(60000).run(); //Iteracija petlje je svake minute
il.onError(function(error){
    console.log(error); //Primanje grešaka
});

/** Primanje povratne informacije od Arduina **/
client_listener = mqtt.connect('mqtt://test.mosquitto.org');
client_listener.subscribe('aquafeed-arduino');
client_listener.on('message', function (topic, message) {
		var sada = getLogDate();
		log.push(sada + ' - Primljena povratna informacija'); //Dodavanje u log povratne informacije
		io.emit('real_log',log);//Real-time 
});

/** Primanje informacija od Desktop Aplikacije **/

//Listener za login
listen_desktop_auth = mqtt.connect('mqtt://test.mosquitto.org');
listen_desktop_auth.subscribe('aquafeed-desktop');
listen_desktop_auth.on('message', function (topic, message) {
	var sada = getLogDate();
	log.push(sada + ' - Login sa desktop aplikacije'); //Dodavanje u log povratne informacije
	io.emit('real_log',log);//Real-time 
	send_info_to_desktop();
});

//Listener za update tablice

/************************ Dopunske Funkcije *******************************/

function send_info_to_desktop(){
	var sendData = '';
	console.log('Slanje na desktop');
	findusers(database, function() {
		//Callback
		//Slaganje polja za slanje na desktop
		sendData = usdata['name'] + '||' + usdata['pass'] + '||';
		//Dohvaćanje zadanih vremena iz baze
		get_table_dates(database, function(){
			//Slaganje ostatka polja
			i = 0;
			do
			{   //Dok su vrijednosti iz baze definirane
				index = ""+i+"";
				sendData += usdata[index] + '||';
				i++;
			}
			while( usdata[index] != undefined );
			//console.log(sendData);
			send_desktop = mqtt.connect('mqtt://test.mosquitto.org');  //Free Broker
			send_desktop.subscribe('aquafeed-send-desktop');
			send_desktop.publish('aquafeed-send-desktop', sendData);
			send_desktop.end();
		});	
	});	
}

/**Autentikacija**/
/**Dohvaćanje vremena iz baze**/

//Poziva se svaki put kada server zaprimi zahtjev za login
function auth_test(req, res, next){
	findusers(database, function() {
		//Callback
		if ((user[0] == usdata['name'] || user[0] == admin[0])&&(user[1] == usdata['pass'] || user[1] == admin[1])){
			//Stvaranje session-a
			req.session.user = user[0]; 
			next();
		}
		else {	
		    user = [];
			next();
		}
	});
	//Dohvaćanje zadanih vremena iz baze
get_table_dates(database, function(){
	dates = [];//Reset dates polja
	//Slaganje dates polja
	i = 0;
	do
	{   //Dok su vrijednosti iz baze definirane
		index = ""+i+"";
		dates[i] = usdata[index];
		i++;
	}
	while( usdata[index] != undefined );
	dates.pop();//Brisanje zadnjeg elementa (null)
		
});	
	
}
//Fja s callback-om
var findusers = function(db, callback) {
   var cursor = db.collection('user').find(); //Dohvaća cijeli dokument
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
		usdata = doc;	
      } else {
        callback();
      }
   });  
};
//'Main' fja-a koja se poziva
var get_table_dates = function(db, callback) {
   ibr = 0;
   var cursor = db.collection('dates').find(); //Dohvaća cijeli dokument
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
		usdata = doc;
		ibr++;		
      } else {
        callback();
      }
   }); 
};

/**Dohvaćanje trenutnog vremena**/
//Server je na UTC vremenskoh zoni
function getNow(){
	var time;
	//var d = new Date();
	var d = new Date( new Date().getTime() + 1 * 3600 * 1000); //UTC + 2,Europe
	var hh = d.getHours().toString();
	var mn = d.getMinutes().toString();	
	if(hh<10) {
		hh='0'+hh;
	} 
	if(mn<10) {
		mn='0'+mn;
	} 
	time = hh +":"+ mn;
	
	return time;
}
//Dohvaćanje punog datuma za log
 function getLogDate() {
	//var n = new Date();
    var n = new Date( new Date().getTime() + 1 * 3600 * 1000); //UTC + 2,Europe
    var year = n.getFullYear();
    var month = n.getMonth()+1; 
    var day = n.getDate();
    var hour = n.getHours();
    var minute = n.getMinutes();
    
	if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
       
    var dateTime = day+'/'+month+'/'+year+' '+hour+':'+minute;   
    return dateTime;
}

/**Fja koja stranicama gasi caching zbog logout-a**/ 
// Koristi se auth bet session-a i cook-ija
//http://stackoverflow.com/questions/20429592/no-cache-in-a-nodejs-server/20429914#20429914
/*function nocache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}*/
