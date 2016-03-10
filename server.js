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
//var mqtt         = require('mqtt');
//var InfiniteLoop = require('infinite-loop');
var app          = express();
var session      = require('client-sessions');

//Extra moduli
var time    	 = require('./lib/time-getting.js');
var db   	     = require('./lib/db-use.js');
var mail   	     = require('./lib/mailer.js');

/** Konfiguracija servera **/

// Port aplikacije
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
//var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

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

app.get('/log', db.log, function(req, res){
	if (req.session.username){
		res.render('log.html', {
			username: req.session.username
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/user', db.userInfo, function(req, res){
	if (req.session.username){
		res.render('user.html');
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

app.get('/logout', function(req, res){	
  req.session.reset();
  res.redirect('/login');
});

app.get('/404', function(req, res){
  res.render('404.html');
});

//POST-ovi sa fronted-a (AJAX)
app.post('/testUser', function(req, res){

	//Testiranje potencijalnog novog korisničkog imena
	db.testUser( req.body.testUsername, req.session.username, function(echo){
		res.send(''+echo); //AJAX slanje, '0'-> dostupno, '1'-> nedostupno, echo varijablom :)
	});
	
});

app.post('/testEmail', function(req, res){

	//Testiranje potencijalnog novog korisničkog kontak maila
	db.testEmailAdress( req.body.testEmail, function(echo){
		res.send(''+echo); //AJAX slanje, '0'-> dostupno, '1'-> nedostupno
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
	console.log('app @ :http://'+ server_port);
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
	socket.on( 'sendCurActMail', function (){
		mail.sendCurAct( socket.request.session.userData[2], socket.request.session.userID ); //Slanje aktivacijskog maila na trenutnu adresu
	});
	socket.on( 'email-update', function (data){
		db.updateEmail( data, socket.request.session.userID ); //Update e-maila u bazi
		mail.sendNewEmail( data, socket.request.session.userID ); //Slanje aktivacijskog e-maila na novu adresu
	});
	
});

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



