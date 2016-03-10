/*
* Funkcije koje sadrže aktivnosti sa bazom
*/

var mysql = require('mysql'); //MYSQL driver (modul)

//SQL Baza podataka na db4free.net
var pool = mysql.createPool({
  host     : 'db4free.net',
  user     : 'equalstring',
  password : 'UEBSAW11391',
  database : 'equaldb'
});

module.exports = { 

	//Auth fj-a
    auth : function( req, res, next ) { 
		
		pool.getConnection(function(err, connection) {
			//Dohvaćanje user-a
			connection.query('SELECT * FROM `Users` WHERE (username="'+req.query.username+'" OR email="'+req.query.username+'") AND passwd="'+req.query.passwd+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release(); //Vraćanje konekcije u pool
			
				// results -> rezultat query-a
				ln = results.length;
				if( ln == 1 ){ //Korisnik postoji
					
					//Stvaranje session-a
					req.session.userID = results[0].userID; //ID
					req.session.username = results[0].userName; //Korisničko ime (ne piše mail)
					req.session.pass = results[0].passwd; //Lozinka
					req.session.activatedMail = results[0].activatedMail; //Aktiviran mail
					
					next();
					
				}
				else { //Korisnik ne postoji
					next();
				}
			
			});
		});	
		
	},
	/** Funckije dohvaćanja podataka iz baze **/
	//Fj-a dohvaćanja vremena
	times : function ( req, res, next ) {
		
		pool.getConnection(function(err, connection) {
			//Dohvaćanje tablice s vremenima
			connection.query('SELECT * FROM `times_'+req.session.userID+'` ORDER BY times',  function (error, rows, fields) { 
				if (error) {
					console.error('error querry: ' + error.stack);
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
				req.session.flags = flags; //Izvedeni flag-ovi
				req.session.ardRet = ardRet; //Arduino flag-ovi
				next();
			});
		});	
	
	},
	//Fj-a dohvaćanja log-a
	log : function ( req, res, next ) {
	
		pool.getConnection(function(err, connection) {
			//Dohvaćanje tablice s log zapisima
			connection.query('SELECT * FROM `log_'+req.session.userID+'` ORDER BY time DESC',  function (error, rows, fields) { 
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
				
				var log = [];
				if ( rows.length == 0) { log = ''; } //Nema zapisa
				for ( i = 0; i < rows.length; i++ ){
					log[i] = rows[i].time +' - '+rows[i].event;
				}
				
				req.session.log = log; //Log
				next();
			});
		});	
	
	},
	//Fj-a dohvaćanja korisničkih podataka
	userInfo : function ( req, res, next ) {
	
		pool.getConnection(function(err, connection) {
			//Dohvaćanje svih korisnikovih podataka
			connection.query('SELECT * FROM `Users` WHERE userID="'+req.session.userID+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
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
					
				next();
					
			});
		});	
	
	},
	/** Funkcije dostupnosti (AJAX pozivi) **/
	//Testiranje novog korisničkog imena
	testUser : function ( testUsername, oldUsername, callback ){ //Mora imati callback ( Asinkroni IO )
	
		var echo;
		if ( testUsername.toUpperCase() === oldUsername.toUpperCase() ){ //To i je korisnikovo trenutno -> mora biti dostupno 
			echo = 0;
			callback(echo); 	
		}else {
			
			pool.getConnection(function(err, connection) {
				//Testiranje novog korisničkog imena
				connection.query('SELECT * FROM `Users` WHERE username="'+testUsername+'" LIMIT 1', function (error, results, fields) {
					if (error) {
						console.error('error querry: ' + error.stack);
						return;
					}
					connection.release();
					
					echo = results.length;
					callback(echo); 				
				});		
			});	
		}	
	
	},
	//Testiranje novog korisničkog e-maila
	testEmailAdress : function (testEmail, callback){
		
		pool.getConnection(function(err, connection) {
			
			connection.query('SELECT * FROM `Users` WHERE email="'+testEmail+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
				
				echo = results.length;
				callback(echo); //Callback rezultata				
			});
		});
		
	},
	/** Update funkcije **/
	//Update vremena u tablici
	updateTimes : function ( newdata, id ){
	
		pool.getConnection(function(err, connection) {
			//Pražnjenje tablice
			connection.query('TRUNCATE TABLE `times_'+id+'`', function (error) { //Brisanje svih zapisa 
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
			});	
		});
		
		for ( i = 0; i < newdata.length; i++ ){
		
			pool.getConnection(function(err, connection) {
				//Unos novih vremena
				connection.query('INSERT INTO `times_'+id+'` (times, flags, ardReturn) VALUES ("'+newdata[i]+'", "0", "0")', function (error) {
					if (error) {
						console.error('error querry: ' + error.stack);
						return;
					}
					connection.release();
				});	
			});
		}
	
	},
	//Update novog korisničkog e-maila
	updateEmail : function (newmail, userID){
	
		pool.getConnection(function(err, connection) {
			
			connection.query('UPDATE `Users` SET email="'+newmail+'", activatedMail="0"  WHERE userID="'+userID+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				connection.release();
							
			});
		});
		
	}
};