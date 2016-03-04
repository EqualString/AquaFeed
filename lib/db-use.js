/*
* Funkcije koje sadrže aktivnosti sa bazom
*/

var mysql = require('mysql'); //MYSQL driver (modul)

//SQL Baza podataka na db4free.net
var connection = mysql.createConnection({
  host     : 'db4free.net',
  user     : 'equalstring',
  password : 'UEBSAW11391',
  database : 'equaldb'
});

module.exports = { 

	//Auth fj-a
    auth : function( req, res, next ) { 
		
		//Dohvaćanje user-a
		connection.query('SELECT * FROM `Users` WHERE (username="'+req.query.username+'" OR email="'+req.query.username+'") AND passwd="'+req.query.passwd+'" LIMIT 1', function (error, results, fields) {
			if (error) {
				console.error('error querry: ' + error.stack);
				return;
			}
			
			// results -> rezultat query-a
			ln = results.length;
			if( ln == 1 ){ //Korisnik postoji
				
				//Stvaranje session-a
				req.session.userID = results[0].userID; //ID
				req.session.username = results[0].userName; //Korisničko ime (ne piše mail)
				req.session.pass = results[0].passwd; //Lozinka
				req.session.activatedMail = results[0].activatedMail; //Aktiviran mail
				
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
				
			}
			else { //Korisnik ne postoji
				next();
			}
		
		});
		
	},
	//Fj-a dohvaćanja vremena
	times : function ( req, res, next ) {
		
		//Dohvaćanje tablice s vremenima
		connection.query('SELECT * FROM `times_'+req.session.userID+'` ORDER BY times',  function (error, rows, fields) { 
			if (error) {
				console.error('error querry: ' + error.stack);
				return;
			}
			
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
	
	},
	//Fj-a dohvaćanja log-a
	log : function ( req, res, next ) {
		
		//Dohvaćanje tablice s log zapisima
		connection.query('SELECT * FROM `log_'+req.session.userID+'` ORDER BY time DESC',  function (error, rows, fields) { 
			if (error) {
				console.error('error querry: ' + error.stack);
				return;
			}
			
			var log = [];
			if ( rows.length == 0) { log = ''; } //Nema zapisa
			for ( i = 0; i < rows.length; i++ ){
				log[i] = rows[i].time +' - '+rows[i].event;
			}
			
			req.session.log = log; //Log
			next();
		});
	
	},
	/** Update funkcije **/
	updateTimes : function ( newdata, id ){
	
		//Pražnjenje tablice
		connection.query('TRUNCATE TABLE `times_'+id+'`', function (error) { //Brisanje svih zapisa 
			if (error) {
				console.error('error querry: ' + error.stack);
				return;
			}
		});	
		
		for ( i = 0; i < newdata.length; i++ ){
		
			//Unos novih vremena
			connection.query('INSERT INTO `times_'+id+'` (times, flags, ardReturn) VALUES ("'+newdata[i]+'", "0", "0")', function (error) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
			});	
			
		}
	
	},
	//Testiranje novog korisničkog imena
	testUser : function ( testUsername, oldUsername, callback ){ //Mora imati callback ( Asinkroni IO )
	
		var ln;
		if ( testUsername.toUpperCase() === oldUsername.toUpperCase() ){ //To i je korisnikovo trenutno -> mora biti dostupno 
			ln = 0;
			callback(ln); 	
		}else {
			
			//Testiranje novog korisničkog imena
			connection.query('SELECT * FROM `Users` WHERE username="'+testUsername+'" LIMIT 1', function (error, results, fields) {
				if (error) {
					console.error('error querry: ' + error.stack);
					return;
				}
				ln = results.length;
				callback(ln); 				
			});		
		}	
	
	},
	updateUser : function (){
	
	}
};