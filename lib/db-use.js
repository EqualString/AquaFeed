/*
* Funkcije koje sadrže aktivnosti sa bazom
*/

var mysql = require('mysql'); //MYSQL driver (modul)

//SQL Baza podataka na db4free.net
var	pool = mysql.createPool({
	host     : 'db4free.net',
	user     : 'equalstring',
	password : 'UEBSAW11391',
	database : 'equaldb'
});


module.exports = { 

	/** Auth **/
    auth : function( req, res ) { 
		
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				res.send('db-error');	
				res.end();
				return;
			}
			//Dohvaćanje user-a (koristi mysql.escape() interno)
			connection.query('SELECT * FROM `Users` WHERE (username= ? OR email= ?) AND passwd= ? LIMIT 1', [req.body.username,req.body.username,req.body.passwd], function (error, results, fields) {
				if (error) {
					res.end();
					return;
				}
				connection.release(); //Vraćanje konekcije u pool
			
				//results -> rezultat query-a
				if( results.length == 1 ){ //Korisnik postoji
					
					//Stvaranje session-a
					req.session.userID = results[0].userID; //ID
					req.session.username = results[0].userName; //Korisničko ime (neće pisati mail)
					req.session.pass = results[0].passwd; //Lozinka
					req.session.activatedMail = results[0].activatedMail; //Aktiviran mail
					
					//Remember me
					if(req.body.rememberme){
						req.session.duration = 90 * 24 * 60 * 60 * 1000; //90 Dana max
						res.send('1'); //Vrati klijentu koji će napravit redirect 
						res.end();
					}
					else{
						req.session.duration = 15 * 60 * 1000; //15 min
						res.send('1'); //Vrati klijentu
						res.end();
					}
					
					
				}
				else { //Korisnik ne postoji
				
					pool.getConnection(function(err, connection) {
						//Testiranje imena/adrese
						connection.query('SELECT * FROM `Users` WHERE username= ? OR email= ? LIMIT 1',[req.body.username,req.body.username], function (error, rows, fields) {
							if (error) {
								return;
							}
							connection.release(); 
							
							if( rows.length != 1 ){
								//Nepostojeće ime/adresa (korisnik)
								res.send('2');
								res.end();
							} else {
								//Neodgovarajuća lozinka
								res.send('3');
								res.end();
							}
						});
					});			
					
				}
			
			});
		});	
		
	},
	/** Funckije dohvaćanja podataka iz baze **/
	//Fj-a dohvaćanja vremena
	times : function ( req, res, next ) {
	
		if(req.session.userID){
		
			pool.getConnection(function(err, connection) {
				if(err){
					console.log("Database Connection error");
					res.send('db-error');	
					res.end();
					return;
				}
				//Dohvaćanje tablice s vremenima
				connection.query('SELECT * FROM `times_'+req.session.userID+'` ORDER BY times',  function (error, rows, fields) { 
					if (error) {
						return;
					}
					connection.release();
					
					var dates = [], flags = [], ardRet=[]; 
					
					//Podaci
					for ( i = 0; i < rows.length; i++ ){
						dates[i] = rows[i].times;
						flags[i] = rows[i].flags;
						ardRet[i] = rows[i].ardReturn;
					}
					
					req.session.times = dates; //Vremena
					req.session.flags = flags; //Poslani flag-ovi
					req.session.ardRet = ardRet; //Arduino flag-ovi
					next();
				});
			});	
		}
		else { 
			next(); 
		}	
	
	},
	//Fj-a Realtime update timeline-a povezana sa REST zahtjevom worker-a
	timeline : function ( req, res, next ) {
	
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				res.send('db-error');	
				res.end();
				return;
			}
			//Dohvaćanje tablice s flagovima iz baze za traženog korisnika
			connection.query('SELECT * FROM `times_'+req.body.key+'` ORDER BY times',  function (error, rows, fields) { 
				if (error) {
					return;
				}
				connection.release();
					
				var flags = [], ardRet = []; 
					
				//Podaci
				for ( i = 0; i < rows.length; i++ ){
					flags[i] = rows[i].flags;
					ardRet[i] = rows[i].ardReturn;
				}
				
				// Lokalne varijable vidljive samo u zahtjevu	
				res.locals.flags = flags; //Poslani flag-ovi
				res.locals.ardRet = ardRet; //Arduino flag-ovi
				next();
			});
		});	
		
	},
	//Fj-a dohvaćanja log-a
	log : function ( req, res, next ) {
	
		if(req.session.userID){
	
			pool.getConnection(function(err, connection) {
				if(err){
					console.log("Database Connection error");
					res.send('db-error');	
					res.end();
					return;
				}
				//Dohvaćanje tablice s log zapisima
				connection.query('SELECT * FROM `log_'+req.session.userID+'`',  function (error, rows, fields) { 
					if (error) {
						return;
					}
					connection.release();
					
					var log = [],br = 0;
					
					// Obrnut ispis jer novi zapisi idu na dno tablice
					if ( rows.length == 0) { log = ''; } //Nema zapisa
					else {
						
						for ( i = rows.length-1; i >= 0; i-- ){
							if(br<=40){ //Socket prenosi samo zadnjih 40 zapisa, nepotrebno je više
								log[br] = rows[i].time +' - '+rows[i].event;
								br++;
							}
						}
						
					}
					
					req.session.cptLog = log; //Log
					next();
					
				});
			});	
		}
		else{
			next();
		}		
	
	},
	//Realtime log fj-a
	realTimeLog : function ( req, res, next ) {
	
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				res.send('db-error');	
				res.end();
				return;
			}
			//Dohvaćanje tablice s log zapisima
			connection.query('SELECT * FROM `log_'+req.body.key+'`',  function (error, rows, fields) { 
				if (error) {
					return;
				}
				connection.release();
					
				var log = [],br = 0;
					
				// Obrnut ispis jer novi zapisi idu na dno tablice
				if ( rows.length == 0) { log = ''; } //Nema zapisa
				else {
			
					for ( i = rows.length-1; i >= 0; i-- ){
						if(br<=40){
							log[br] = rows[i].time +' - '+rows[i].event;
							br++;
						}
					}
					
				}
					
				res.locals.log = log; //Log
				next();
				
			});
		});	
		
	},
	//Fj-a dohvaćanja korisničkih podataka
	userInfo : function ( req, res, next ) {
	
		if(req.session.userID){
	
			pool.getConnection(function(err, connection) {
				if(err){
					console.log("Database Connection error");
					res.send('db-error');	
					res.end();
					return;
				}
				//Dohvaćanje svih korisnikovih podataka
				connection.query('SELECT * FROM `Users` WHERE userID="'+req.session.userID+'" LIMIT 1', function (error, results, fields) {
					if (error) {
						return;
					}
					connection.release(); //Vraćanje konekcije u pool
				
					//Svi podaci o korisniku
					req.session.userData = [];
					req.session.userData[0] = results[0].userName;
					req.session.userData[1] = results[0].passwd;
					req.session.userData[2] = results[0].email;
					req.session.userData[3] = results[0].firstName; 
					req.session.userData[4] = results[0].lastName; 
					req.session.userData[5] = results[0].adress;
					req.session.userData[6] = results[0].activatedMail;
					req.session.userData[7] = results[0].timeZone;
					//req.session.userData[8] = results[0].stoppedAuto;
						
					next();
						
				});
			});	
		}
		else{
			next();
		}	
	
	},
	
	/*
	*	Funkcije dostupnosti (AJAX pozivi) 
	*/
	
	//Testiranje novog korisničkog imena
	testUser : function (req, res){ 
	
		if ( req.body.testUsername.toUpperCase() === req.session.username.toUpperCase() ){ //To i je korisnikovo trenutno -> mora biti dostupno 
			res.send('0');	
		}else {
			
			pool.getConnection(function(err, connection) {
				if(err){
					console.log("Database Connection error");
					res.send('db-error');	
					res.end();
					return;
				}
				//Testiranje novog korisničkog imena
				connection.query('SELECT * FROM `Users` WHERE username="'+req.body.testUsername+'" LIMIT 1', function (error, results, fields) {
					if (error) {
						res.send('1'); //0-> Dostupno, 1-> Nedostupno	
						res.end();	
						return;
					}
					connection.release();
					
					echo = results.length;
					res.send(''+echo); //0-> Dostupno, 1-> Nedostupno	
					res.end();		
				});		
			});	
		}	
	
	},
	//Testiranje novog korisničkog e-maila
	testEmailAdress : function (req, res){
		
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				res.send('db-error');	
				res.end();
				return;
			}
			connection.query('SELECT * FROM `Users` WHERE email="'+req.body.testEmail+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
				
				echo = results.length;
				res.send(''+echo); //0-> Dostupno, 1-> Nedostupno	
				res.end();				
			});
		});
		
	},
	
	/* 
	*	Update funkcije 
	*/
	
	//Update vremena u tablici
	updateTimes : function (newdata, id){
		
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				return;
			}
			//Pražnjenje tablice
			connection.query('TRUNCATE TABLE `times_'+id+'`', function (error, results, fields) { //Brisanje svih zapisa 
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
				
				for ( i = 0; i < newdata.length-1; i++ ){
					
					pool.getConnection(function(i, err, connection) { //getConnection-> asinkrona funkcija
						//Unos novih vremena
						connection.query('INSERT INTO `times_'+id+'` (times, flags, ardReturn) VALUES ("'+newdata[i]+'", "0", "0")', function (error, results, fields) {
							if (error) {
								console.error('error querry: ' + error.stack);
								return;
							}
							connection.release();
						});	
					}.bind(pool, i)); //"Trik" za asinkrono rješavanje ("povezan" i sa pool-om), async nije bio potreban :-)
				}
				
				pool.getConnection(function(err, connection) { 
					//Update log-a
					connection.query('INSERT INTO `log_'+id+'` (time, event) VALUES ("'+newdata[newdata.length-1]+'", "Promjena vremena u tablici")', function (error, results, fields) {
						if (error) {
							console.error('error querry: ' + error.stack);
							return;
						}
						connection.release();
					});	
				});			
				
			});	
		});
		
	},
	//Update novog korisničkog e-maila
	updateEmail : function (newmail, userID){
	
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				return;
			}
			
			connection.query('UPDATE `Users` SET email="'+newmail[0]+'", activatedMail="0"  WHERE userID="'+userID+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
			
			});
			
			pool.getConnection(function(err, connection) { 
				//Update log-a
				connection.query('INSERT INTO `log_'+userID+'` (time, event) VALUES ("'+newmail[1]+'", "Promjena korisničkog e-maila")', function (error, results, fields) {
					if (error) {
						console.error('error querry: ' + error.stack);
						return;
					}
					connection.release();
				});	
			});	
		});
		
	},
	//Update vremenske zone
	updateTimeZone : function (newZone, userID){
	
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				return;
			}
			
			connection.query('UPDATE `Users` SET timeZone="'+newZone[0]+'"  WHERE userID="'+userID+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
			
			});
			
			pool.getConnection(function(err, connection) { 
				//Update log-a
				connection.query('INSERT INTO `log_'+userID+'` (time, event) VALUES ("'+newZone[1]+'", "Promjena vremenske zone")', function (error, results, fields) {
					if (error) {
						console.error('error querry: ' + error.stack);
						return;
					}
					connection.release();
				});	
			});		
				
		});
		
	},
	//Update novih podataka za login
	updateCredentials : function (userInfo, userID){
	
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				return;
			}
			
			connection.query('UPDATE `Users` SET username="'+userInfo[0]+'", passwd="'+userInfo[1]+'"  WHERE userID="'+userID+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
				
				pool.getConnection(function(err, connection) { 
					//Update log-a
					connection.query('INSERT INTO `log_'+userID+'` (time, event) VALUES ("'+userInfo[3]+'", "Promjena korisničkih podataka")', function (error, results, fields) {
						if (error) {
							console.error('error querry: ' + error.stack);
							return;
						}
						connection.release();
					});	
				});		
				
			});
		});
		
	},
	//Update log-a za trenutno hranjenje
	updateNowFeedLog : function (data){
		
		pool.getConnection(function(err, connection) { 
			if(err){
				console.log("Database Connection error");
				return;
			}
			//Update log-a
			connection.query('INSERT INTO `log_'+data[0]+'` (time, event) VALUES ("'+data[1]+'", "Poslan trenutni zahtjev")', function (error, results, fields) {
				if (error) {
					return;
				}
				connection.release();
			});	
		});		
	
	},
	//Aktivacija e-maila
	activateEmail : function ( req,res ){
	
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				res.send('db-error');	
				res.end();
				return;
			}
			//Dohvaćanje user-a
			connection.query('SELECT * FROM `Users` WHERE userID="'+res.locals.user+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					res.send('2');
					res.end();
					return;
				}
				connection.release(); 
				
				// results -> rezultat query-a
				if( results.length == 1 ){ //Korisnik postoji
					
					if(results[0].activatedMail == '0'){ //Neaktiviran mail
					
						pool.getConnection(function(err, connection) {
							connection.query('UPDATE `Users` SET activatedMail="1" WHERE userID="'+res.locals.user+'" LIMIT 1', function (error, results, fields) {
								if (error) {
									return;
								}
								connection.release();
							
								pool.getConnection(function(err, connection) { 
									//Update log-a
									connection.query('INSERT INTO `log_'+res.locals.user+'` (time, event) VALUES ("'+req.body.logtime+'", "Aktivacija e-mail adrese")', function (error, results, fields) {
										if (error) {
											return;
										}
										connection.release();
										res.send('1');
										res.end();
									});	
								});	
							});
							
						});		
					
					}
					else{ //Adresa je vec aktivirana
						res.send('3');
						res.end();
					}					
			
				}
				else{ //Korisnik ne postoji sa tim id-om
					res.send('2');
					res.end();
				}	
				
			});
		
		});
	
	},
	//Prvi korak "izgubljene lozinke"
	findUser : function (req, res){
	
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				res.send('db-error');	
				res.end();
				return;
			}
			//Dohvaćanje user-a (koristi mysql.escape() interno)
			connection.query('SELECT * FROM `Users` WHERE (username= ? OR email= ?) LIMIT 1', [req.body.username,req.body.username], function (error, results, fields) {
				if (error) {
					res.send('2'); 
					res.end();
					return;
				}
				connection.release(); //Vraćanje konekcije u pool
			
				if( results.length == 1 ){ //Korisnik postoji
					res.send('1'); 
					res.end();
				}
				else { //Korisnik ne postoji
					res.send('2'); 
					res.end();
				}
			});
		});	
	},
	//Drugi korak "izgubljene lozinke"
	saveNewPass : function (req, res, next){
		
			pool.getConnection(function(err, connection) {
				if(err){
					console.log("Database Connection error");
					res.send('db-error');	
					res.end();
					return;
				}
				//Update lozinke
				connection.query('UPDATE `Users` SET passwd= "'+res.locals.newpass+'" WHERE (username= "'+req.body.user+'" OR email= "'+req.body.user+'") LIMIT 1', function (error, results, fields) {
					if (error) {
						res.send('2'); 
						res.end();
						return;
					}
					connection.release(); 
				
					pool.getConnection(function(err, connection) {
						//Dohvaćanje obnovljenog id-a
						connection.query('SELECT * FROM `Users` WHERE (username= "'+req.body.user+'" OR email= "'+req.body.user+'") LIMIT 1', function (error, results, fields) {
							if (error) {
								res.send('2'); 
								res.end();
								return;
							}
							connection.release(); 
						
							if( results.length == 1 ){ 
							
								//Lokalne varijable za zahtjev
								res.locals.userID = results[0].userID;
								res.locals.email = results[0].email;
								res.locals.userName = results[0].userName;
								
								pool.getConnection(function(err, connection) { 
									//Update log-a
									connection.query('INSERT INTO `log_'+res.locals.userID+'` (time, event) VALUES ("'+req.body.logtime+'", "Obnova zaboravljene lozinke")', function (error, results, fields) {
										if (error) {
											res.send('2'); 
											res.end();
											return;
										}
										connection.release();
										next();
									});	
								});	
							}
							else{
								res.send('2'); 
								res.end();
							}
							
						});
					});	
				
				});
			});	
		
	},
	//Subscribe lista
	subsList : function (req, res){
		
		pool.getConnection(function(err, connection) {
			if(err){
				console.log("Database Connection error");
				res.send('db-error');	
				res.end();
				return;
			}
			connection.query('SELECT * FROM `Subs` WHERE sub="'+req.body.sub+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					res.send('2'); 
					res.end();
					return;
				}
				connection.release(); 
				
				if( results.length == 1 ){ 
					res.send('1');
					res.end();
				}
				
				else{
				
					pool.getConnection(function(err, connection) { 
						connection.query('INSERT INTO `Subs` (Sub) VALUES ("'+req.body.sub+'")', function (error, results, fields) {
							if (error) {
								res.send('2'); 
								res.end();
								return;
							}
							connection.release();
							res.send('0');
							res.end();
						});	
					});	
					
				}
			
			});
		});	
	
	}
};