var socket = io.connect();
var userID,timesData,izvedeni,returned;

window.onbeforeunload = function(e) {
	socket.close();
	socket.disconnect();
};

socket.on('times',function(data){

	if(data==null){ // Test sesije, jer postoji handshake socketa i client-sessiona
		window.location = '/login';
	}
	timesData = data;
	var len = timesData.length;
	$("#heading").html('');
	
	if(len == 0){
		$("#heading").append('<i class="fa fa-clock-o"></i> Nemate predviđenih događaja.');
	}
	else if(len == 1){
		$("#heading").append('<i class="fa fa-clock-o"></i> Imate 1. događaj koji se izvodi svakodnevno.');
	}
	else{
		$("#heading").append('<i class="fa fa-clock-o"></i> Imate '+len+'. događaja koji se izvode svakodnevno.');
	}
	
	socket.on('flags',function(data){
	
		izvedeni = data;
		
		socket.on('ardRet',function(data){
		
			returned = data;
			
			setTimeout( function(){	
				
				//Loader
				$('.loading-container').fadeOut(535, function() {
					$(this).remove();
					animInit();
				});
					
				startTime();
				timeline();
					
			},1270); 
			
		});
		
	});

});

/** Realtime komunikacija sa workerom putem REST POST-a koji obrađuje server **/
socket.on('userID',function(data){
	
	userID = data; // Dohvaćanje ID-a korisnika
	
	// Jedinstveni konekcijski stringovi za korisnika
	var connString_1 = 'update-flags-ID-'+userID; 
	var connString_2 = 'update-ardRet-ID-'+userID;
	
	// Realtime socket komunikacija
	socket.on(connString_1,function(data){ 
		
		izvedeni = data; // Izvedeni flagovi
		
		socket.on(connString_2,function(data){ 
		
			returned = data; // Vraćeni od strane arduina
			timeline(); // Izgradi timeline ponovno
			
		});
		
	});
});

function timeline() {

	var done1,done2;
	var len = timesData.length;
	var timeline = $('.tmtimeline');
	
	timeline.html('');// Obriši
	
	for (var i=0;i<len;i++){
		
		if (izvedeni[i] == 1){ // Ako ima flag da je izveden
			done1 = "glyphicon-ok";
		}
		else {
			done1 = "glyphicon-remove";
		}
		if (returned[i] == 1){ // Ako ima flag da je vracena povratna informacija
			done2 = "glyphicon-ok";
		}
		else {
			done2 = "glyphicon-remove";
		}
		
		timeline.append('<li><time class="tmtime"><span>'+timesData[i]+'</span></time>'
			+'<div class="tmicon icon-fishes"></div>'
			+'<div class="tmlabel">'
			+'<h2>'+(i+1)+'. Dnevno hranjenje</h2>'
			+'<p>Zahtjev poslan - <i class="status-icon glyphicon '+done1+'"></i><span class="right-status">Zahtjev odrađen - <i class="status-icon glyphicon '+done2+'"></i></span></p>'
			+'</div>'
			+'</li>');	
	}
}

function startTime() { //Funkcija prikazanog vremena

	currentTime = moment().format('HH:mm');
	$('#live-clock').val(currentTime);
	var t = setTimeout(function(){startTime()},1000);
	
}

function nahrani_sada (){ // Trenutno hranjenje 

	var nowFeed = [];
	nowFeed[0] = userID;
	nowFeed[1] = moment().format('DD/MM/YYYY HH:mm'); //Zadnja vrijednost je logTime
	socket.emit('nowfeed', nowFeed);
	$('#modal-succes').modal('show');
	
}
