var express = require('express');
var mqtt = require('mqtt');
var io = require('socket.io')(server);
var InfiniteLoop = require('infinite-loop');
var app = express();
var user =[],db_user =[], sem = true, semi = true, auth, log =[];
var izvedeni=[],d,e,datus,ln,i,now;
var fs = require('fs');

var admin =[];//Admin user
admin[0] = "EqualString";
admin[1] = "Luafr";

// port aplikacije
// process.env.PORT dopušta da Heroku postavlja vlastiti port
var envport = process.env.PORT || 3000;

app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');

//Server Router

app.get('/', nocache, function(req, res){
  res.render('index.html', {
	  username: user[0],
	  auth: auth
  });
});

app.get('/index-login', nocache, function(req, res){
  if (auth === true){
	  res.redirect('/');
  } else{
	  res.redirect('/login-failed');
  }
});

app.get('/login-failed', nocache, function(req, res){
  res.render('login-failed.html', {
	  username: user[0],
	  auth: auth
  });
});

app.get('/login', nocache, function(req, res){
  res.render('login.html', {
	  username: user[0],
	  auth: auth
  });
});

app.get('/events', nocache, function(req, res){
  if (auth === true){
  res.render('events.html', {
	username: user[0]
  });
  } else{
	 res.redirect('/login-failed');
	}
});

app.get('/timeline', nocache, function(req, res){
  if (auth === true){
  res.render('timeline.html', {
	username: user[0]
  });
  } else{
	 res.redirect('/login-failed');
	}
});

app.get('/email', nocache, function(req, res){
  if (auth === true){
  res.render('email.html', {
	username: user[0]
  });
  } else{
	 res.redirect('/login-failed');
	}
});

app.get('/errors', nocache, function(req, res){
  if (auth === true){
  res.render('errors.html', {
	username: user[0]
  });
  } else{
	 res.redirect('/login-failed');
	}
});

app.get('/log', nocache, function(req, res){
  if (auth === true){
  res.render('log.html', {
	username: user[0]
  });
  } else{
	 res.redirect('/login-failed');
	}
});

app.get('/user', nocache, function(req, res){
  if (auth === true){
	res.render('user.html');
  } else{
	 res.redirect('/login-failed');
	}
});

app.get('/logout', nocache, function(req, res){	
  auth = false;	
  res.redirect('/login');
});

app.get('/404', nocache, function(req, res){
  res.render('404.html');
});
	
//Redirektanje
app.get('/index', nocache, function(req, res){
  res.redirect('/');
});
app.get('/index.html', nocache, function(req, res){
  res.redirect('/');
});
app.get('/events.html', nocache, function(req, res){
  res.redirect('/events');
});
app.get('/timeline.html', nocache, function(req, res){
  res.redirect('/timeline');
});
app.get('/email.html', nocache, function(req, res){
  res.redirect('/email');
});
app.get('/errors.html', nocache, function(req, res){
  res.redirect('/errors');
});
app.get('/log.html', nocache, function(req, res){
  res.redirect('/log');
});
app.get('/user.html', nocache, function(req, res){
  res.redirect('/user');
});
app.get('/login.html', nocache, function(req, res){
  res.redirect('/login');
});

//Konfiguracija servera
var server = app.listen(envport, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app @ :http://localhost:3000/');
});

app.use(express.static(__dirname + '/public'));//Koristi sve iz folder 'public'

//Stranica 404
app.use(function(req, res) {
    res.redirect('/404');
});

//Socket.io 
var io = require('socket.io')(server);
io.on('connection', function(socket){
	//Slanje
	socket.emit( 'datumi', d = get_dates()); //Emitiranje vrijednosti iz tablice
	socket.emit( 'izvoz', izvedeni); //Emitiranje flagova
	socket.emit( 'log', log); //Emitiranje zapisnika
	socket.emit( 'us', e = get_user()); //Emitiranje zapisnika
	//Primanje
	socket.on('login_info', function(infos){
		user[0] = infos[0];
		user[1] = infos[1];
		test_auth(user);
	});
	
	//Izmjena računa/lozinke
	socket.on('change_user', function(infodata){
		var fm = require('fs');
		var str = fm.createWriteStream("./data/user.dat");
		str.once('open', function(fd) {
			for (i = 0; i< 2; i++){
				str.write(infodata[i]);
				str.write("|");
			}
		str.end();
		});
		
		user = infodata;
		
	});
	
	socket.on('table_data', function(data){
		ln = data.length;
		for (i = 0; i< ln; i++){
			izvedeni[i] = false; //Resetiranje flag-ova radi novih vrijednosti (eventualnih)
		}
		sem = false; //Dok se nove vrijednosti zapisuju, ne moze se pristupiti u beskonačnoj loop-petlji [binarni semafor ! :-)]
		var fs = require('fs');
		var stream = fs.createWriteStream("./data/dates.dat");
		stream.once('open', function(fd) {
			for (i = 0; i< ln; i++){
				stream.write(data[i]);
				stream.write(" | ");
			}
		stream.end();
		sem = true;// Omogućeno čitanje
		});
	});
	
	//Trenutno hranjenje
	socket.on('nowfeed', function(){
		client = mqtt.connect('mqtt://test.mosquitto.org');  //Free Broker
		client.subscribe('aquafeed');
		client.publish('aquafeed', 'date');
		console.log("Poslah sada");
		var sada = getLogDate();
		log.push(sada);
		io.emit('real_log',log);
		client.end();
	});
	
});

var il = new InfiniteLoop;
function loop() {
	if (sem == true){ //Ako se neupisuju nove vrijednosti
		var dates = get_dates();
		now = getNow();
		var test_sun = new Date();
		var sun = test_sun.getDay().toString(); //Dohvaćanje dana u tjednu, 0-ned,1-pon..
		ln = dates.length;
		for (i = 0; i < ln; i++){
			if (dates[i] == now){
				client = mqtt.connect('mqtt://test.mosquitto.org');  //Free Broker
				client.subscribe('aquafeed');
				client.publish('aquafeed', 'date');
				console.log("Poslah u "+dates[i]);
				izvedeni[i] = true; //Flag da je izvedeno hranjenje
				var sada = getLogDate();
				log.push(sada);
				io.emit('jesam',izvedeni);
				io.emit('real_log',log);
				client.end();
			}
		}
		
		//Resetiranje flag-ova izvedenih svakih 24-sata
		if (now == "00:00"){
			for (i = 0; i< ln; i++){
				izvedeni[i] = false;
			}
		}
		//Resetiranje log-a svake nedjelje u 1:00 
		if ((now == "01:00")&&(sun == "0")){
			log = [];
		}
		
	}
}
il.add(loop,[]).setInterval(60000).run();
il.onError(function(error){
    console.log(error);
});

function get_dates(){
	datus = [];
	var datus = fs.readFileSync('./data/dates.dat').toString().split(" | ");
	datus.pop(); //makni zadnji element, ''
	return datus;
} 

function get_user(){
	db_user = fs.readFileSync('./data/user.dat').toString().split("|");
	//dbuser.pop(); //makni zadnji element, ''
	return db_user;
} 

//Dohvaćanje trenutnog vremena
function getNow(){
	var time;
	//var d = new Date();
	var d = new Date( new Date().getTime() + 2 * 3600 * 1000); //UTC + 2,Europe
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
    var n = new Date( new Date().getTime() + 2 * 3600 * 1000); //UTC + 2,Europe
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
//Testiranje autentikacije
function test_auth(user){
	db_user = get_user();
	if ((user[0] == db_user[0] || user[0] == admin[0])&&(user[1] == db_user[1] || user[1] == admin[1])){
		auth = true;
	}
	else auth = false;
}

//Fja koja stranicama gasi caching zbog logout-a 
//http://stackoverflow.com/questions/20429592/no-cache-in-a-nodejs-server/20429914#20429914
function nocache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}
