/* 
|------------------------------------------|
| AquaFeed - IoT nodejs Server             |
|------------------------------------------|
| @author:  Egredžija Alen                 |
| @version: 2.3 (1.10.2015)                |
| @website: http://aquafeed.cleverapps.io  |
|------------------------------------------|
*/

// Dopunske vendor skripte (moduli)
var express      = require('express');
var bodyParser   = require('body-parser');
//var mysql        = require('mysql'); 
//var assert       = require('assert');
//var mqtt         = require('mqtt');
//var InfiniteLoop = require('infinite-loop');
var app          = express();
var session      = require('client-sessions');

//Extra moduli
var time    	 = require('./lib/time-getting.js');
var db   	     = require('./lib/db-use.js');

/** Konfiguracija servera **/

// Port aplikacije
// var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

//SQL Baza podataka na db4free.net
/*var connection = mysql.createConnection({
  host     : 'db4free.net',
  user     : 'equalstring',
  password : 'UEBSAW11391',
  database : 'equaldb'
});*/

// Express konfiguracija
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');

var sessionMiddleware = session({
	cookieName: 'session',
	secret: 'GotYaBlueFishTank?',  //Tajni string
	duration: 7 * 24 * 60 * 60 * 1000, //Tjedna sessija
});

app.use(sessionMiddleware);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/** Server rute **/

app.get('/', function(req, res){
	res.render('index.html', {
		username: req.session.username //Ovisi o cookie-u
	});
});

app.get('/index-auth', db.auth, function(req, res){
	if (req.session.username){
		res.redirect('/');
	} else{
		res.redirect('/login-failed');
	}
});

app.get('/login-auth', db.auth, function(req, res){
	if (req.session.username){
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

app.get('/timeline', db.times, function(req, res){
	if (req.session.username){
		res.render('timeline.html', {
			username: req.session.username
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/events', db.times, function(req, res){
	if (req.session.username){
		res.render('events.html', {
			username: req.session.username
		});
	} else{
		res.redirect('/login');
  }
});

app.get('/email', function(req, res){
	if (req.session.username){
		res.render('email.html', {
			username: req.session.username
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/errors', function(req, res){
	if (req.session.username){
		res.render('errors.html', {
			username: req.session.username
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/log', db.log, function(req, res){
	if (req.session.username){
		res.render('log.html', {
			username: req.session.username
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/user', function(req, res){
	if (req.session.username){
		res.render('user.html');
	} else{
		res.redirect('/login');
	}
});

app.get('/logout', function(req, res){	
  req.session.reset();
  res.redirect('/login');
});

app.get('/404', function(req, res){
  res.render('404.html');
});

app.post('/testUser', function(req, res){

	//Testiranje potencijalnog novog korisničkog imena
	db.testUser( req.body.testUsername, req.session.username, function(echo){
		res.send(''+echo); //AJAX slanje, '0'-> dostupno, '1'-> nedostupno, echo varijablom :)
	});
	
});

//Redirektanje
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
	var host = server.address().address;
	var port = server.address().port;
	console.log('app @ :http://localhost:8080/');
});

app.use(express.static(__dirname + '/public'));//Koristi sve iz foldera 'public'

//Stranica 404, nema respons-a od middleware-a
app.use(function(req, res) {
    res.redirect('/404');
});

/** Socket.io **/
//Inicijalizacija socket-a
var io = require('socket.io').listen(server);

//Sessija se share-a između socketa i express-a
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

//Eventi
io.sockets.on("connection", function(socket) {

	//Slanje
	socket.emit( 'times', socket.request.session.times ); //Slanje vremena
	socket.emit( 'log', socket.request.session.log ); //Emitiranje zapisnika
	socket.emit( 'flags', socket.request.session.flags ); //Emitiranje flagova
	socket.emit( 'userData', socket.request.session.userData ); //Emitiranje svih korisničkih podataka
	
	//Primanje
	socket.on( 'times-update', function (data){
		db.updateTimes( data, socket.request.session.userID ); //Update vremena
	});
	/*socket.on( 'testUser', function (data){
		db.testUser( data, socket.request.session.username, function (echo){
			socket.emit( 'testedUser' , echo ); //Echo je povratak putem socketa :-), (1->dostupno,0->nedostupno)
		});
	});*/
	
});

/** Server akcije **/
//Socket.io 
//Korištenje socketa za real-time komunikaciju client-server dijela
/*var io = require('socket.io')(server);
io.on('connection', function(socket){
	
	//Slanje
	//Emitiranje vrijednosti iz tablice
	socket.emit( 'izvoz', izvedeni ); //Emitiranje flagova
	socket.emit( 'log', log ); //Emitiranje zapisnika
	socket.emit( 'user_credentials', user ); //Emitiranje zapisnika*/

	//Primanje login informacija
	/*socket.on('login_info', function(infos){
		user[0] = infos[0];
		user[1] = infos[1];
	});*/
	
	//Izmjena računa/lozinke
	/*socket.on('change_user', function(infodata){
		//Chainano zbog redoslijeda operacija 1.brisanje, 2.ubacivanje
		database.collection('user').deleteMany( {}, function() {
			database.collection('user').insertOne( {
				"name" : infodata[0],
				"pass" : infodata[1],
			}, function(err, result) {
				assert.equal(err, null);
				user = infodata; //Novi user[] 
				var sada = time.getLogDate();
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
			var sada = time.getLogDate();
			log.push(sada+' - Promjena vrijednosti u tablici'); //Dodavanje u log
		});
			
	});
	
	//Trenutno hranjenje
	socket.on('nowfeed', function(){
		client = mqtt.connect('mqtt://test.mosquitto.org');  //Free Broker
		client.subscribe('aquafeed');
		client.publish('aquafeed', 'feed');
		//console.log("Poslah sada");
		var sada = time.getLogDate();
		log.push(sada+' - Poslan zahtjev'); //Dodavanje u log da je poslan zahtjev
		client.end();
	});
	
});*/

/**Fja koja stranicama gasi caching zbog logout-a**/ 
// Koristi se auth bet session-a i cook-ija
//http://stackoverflow.com/questions/20429592/no-cache-in-a-nodejs-server/20429914#20429914
/*function nocache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}
*/



