var socket = io.connect();
var userID,timesData,izvedeni,returned,string;

window.onbeforeunload = function(e) {
	socket.close();
	socket.disconnect();
};

socket.on('times',function(data){

	if(data==null){ //Test sesije
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

socket.on('updateFlags',function(data){
	alert("!");
});

function timeline() {
	var done1,done2;
	var len = timesData.length;
	var timeline = $('.tmtimeline');
	
	timeline.html('');//Obriši
	
	for (var i=0;i<len;i++){
		
		if (izvedeni[i] == 1){ //Ako ima flag da je izveden
			done1 = "glyphicon-ok";
		}
		else {
			done1 = "glyphicon-remove";
		}
		if (returned[i] == 1){ //Ako ima flag da je vracena povratna informacija
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

function startTime() {

	currentTime = moment().format('HH:mm');
	$('#live-clock').val(currentTime);
	var t = setTimeout(function(){startTime()},1000);
	
}

function nahrani_sada (){

	socket.emit('nowfeed');
	$('#modal-succes').modal('show');
	
}
