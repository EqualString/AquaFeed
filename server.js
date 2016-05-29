/* 
|------------------------------------------|
| AquaFeed - IoT nodejs Server             |
|------------------------------------------|
| @author:  Egredžija Alen                 |
| @version: 2.3 (1.10.2015)                |
| @website: http:// aquafeed.cleverapps.io |
|------------------------------------------|
*/

// Dopunske vendor skripte (moduli)
var express      = require('express');
var bodyParser   = require('body-parser');
var app          = express();
var session      = require('client-sessions');

// Extra moduli
var db   	     = require('./lib/db-use.js');
var tools  	     = require('./lib/tools.js');

/** Konfiguracija servera **/

// Port aplikacije
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.set('port', server_port);
app.set('ip', server_ip_address);

// Express konfiguracija
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');

var sessionMiddleware = session({
	cookieName: 'session',
	secret: 'GotYaBlueFishTank?',  // Tajni string
	duration: 7 * 24 * 60 * 60 * 1000, // Tjedna sessija
	cookie:{
		httpOnly: false
	}
});

app.use(sessionMiddleware);
app.use(bodyParser.json()); // support za json encoded body
app.use(bodyParser.urlencoded({ extended: true })); // support za encoded body

/** Server rute **/
app.get('/', function(req, res){
	res.render('index.html', {
		username: req.session.username // Ovisi o cookie-u
	});
});

app.get('/login', function(req, res){
	if (req.session.username){
		res.redirect('/timeline'); // Ako postoji sessija
	} else{
		res.render('login.html');
	}
  
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

app.get('/email', db.userInfo, function(req, res){
	if (req.session.username){
		res.render('email.html', {
			username: req.session.username
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/logout', function(req, res){
	if (req.session.username){	
		req.session.destroy();
		req.session.reset();
		res.redirect('/');  
	} else{
		res.redirect('/404');
	}		
});

app.get('/404', function(req, res){
  res.render('404.html');
});

app.get('/activation-mail', function(req, res){
  res.render('activation.html');
});

app.get('/lost-password', function(req, res){
  res.render('lost-password.html');
});

// POST-ovi sa fronted-a (AJAX)

app.post('/login-auth', db.auth); // Login 

app.post('/session-username', function(req, res){ // Promjena korisničkog imena sessije bez /logout-a
	req.session.username = req.body.newUsername;
	res.send('1');
}); 

app.post('/testUser', db.testUser); // Testiranje potencijalnog novog korisničkog imena

app.post('/testEmail', db.testEmailAdress); // Testiranje potencijalnog novog korisničkog maila

app.post('/email-activation', tools.decryptID, db.activateEmail); // Aktivacija e-mail adrese

app.post('/password-reset-step-one', db.findUser); // Prvi korak u resetiranju izgubljene lozinke (trazenje korisnika u bazi)

app.post('/password-reset-step-two', tools.createPass, db.saveNewPass, tools.sendNewPassMail); // Drugi korak u resetiranju izgubljene lozinke (generiranje nove lozinke, spremanje u bazu i slanje maila sa novim podacima)

// REST api (info sa worker aplikacije)
app.post('/api/worker', db.timeline, db.realTimeLog, function(req, res){
	
	// Jedinstveni konekcijski stringovi
	var connString_1 = 'update-flags-ID-'+req.body.key;
	var connString_2 = 'update-ardRet-ID-'+req.body.key;
	var connString_3 = 'update-log-ID-'+req.body.key;
	
	// Slanje novih vrijednosti iz baze putem socketa na timeline i log
	io.emit(connString_1, res.locals.flags);
	io.emit(connString_2, res.locals.ardRet);
	io.emit(connString_3, res.locals.log);

});

// Redirektanje
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

/** Konfiguracija servera **/

// OpenShift(server_port & server_ip)
var server = require('http').createServer(app);
server.listen(app.get('port'), app.get('ip'), function(){
	console.log('app @ :http:// '+ server_port);
});

app.use(express.static(__dirname + '/public'));// Koristi sve iz foldera 'public'

// Stranica 404, nema respons-a od middleware-a
app.use(function(req, res) {
    res.redirect('/404');
});

/** Socket.io **/
// Inicijalizacija socket-a
var io = require('socket.io').listen(server);

// Sessija se share-a između socketa i express-a
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Eventi
io.sockets.on("connection", function(socket) {

	// Slanje na konekciji frontend-a
	socket.emit( 'userID', socket.request.session.userID ); // Emitiranje ID-a
	socket.emit( 'times', socket.request.session.times ); // Emitiranje vremena
	socket.emit( 'log', socket.request.session.log ); // Emitiranje zapisnika
	socket.emit( 'flags', socket.request.session.flags ); // Emitiranje flagova
	socket.emit( 'ardRet', socket.request.session.ardRet ); // Emitiranje flagova od strane Arduina
	socket.emit( 'userData', socket.request.session.userData ); // Emitiranje svih korisničkih podataka
	
	// Primanje
	socket.on( 'times-update', function (data){
		db.updateTimes( data, socket.request.session.userID ); // Update vremena
	});
	socket.on( 'timeZone-update', function (data){
		db.updateTimeZone( data, socket.request.session.userID ); // Update vremenske zone
	});
	socket.on( 'newCred-update', function (data){
		db.updateCredentials( data, socket.request.session.userID ); // Update novih podataka za prijavu (Novo ime&lozinka)
	});
	socket.on( 'sendCurActMail', function (){
		tools.sendActivationMail( socket.request.session.userData[2], socket.request.session.userID ); // Slanje aktivacijskog maila na trenutnu adresu
	});
	socket.on( 'email-update', function (data){
		db.updateEmail( data, socket.request.session.userID ); // Update e-maila u bazi
		tools.sendActivationMail( data[0], socket.request.session.userID ); // Slanje aktivacijskog e-maila na novu adresu
	});
	socket.on( 'nowfeed', function (data){
		db.updateNowFeedLog( data ); // Update log-a za trenutni zahtjev
		tools.sendNowFeedRequest( data[0] ); // Proslijeđivanje zahtjeva na worker
	});

});





