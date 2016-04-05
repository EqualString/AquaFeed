
var socket = io.connect();
var dd,izvedeni,returned;

window.onbeforeunload = function(e) {
  socket.disconnect();
};

socket.on('times',function(data){

	dd = data;
	var len = dd.length;

	if( len == 1){
		$("#heading").append('<i class="fa fa-clock-o"></i> Imate '+len+'. događaj koji se izvodi svakodnevno.');
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
				});
				
				
				startTime();
				timeline();
				
			},1270); 	
			
		});
		
	});

});

socket.on('jesam',function(data){
	izvedeni = data;
	timeline();
});

function timeline() {
	var done1,done2;
	var len = dd.length;
	var timeline = $('.tmtimeline')
						
	timeline.html('');//Obriši
							
	for (var i=0;i<len;i++){
		
		
		if (izvedeni[i] == 1){ //Ako ima flag da je izveden
			done1 = "glyphicon-ok";
		}
		else {
			done1 = "glyphicon-remove";
		}
		if (returned[i] == 1){ //Ako ima flag da je izveden
			done2 = "glyphicon-ok";
		}
		else {
			done2 = "glyphicon-remove";
		}
		
		
		timeline.append('<li><time class="tmtime"><span>'+dd[i]+'</span></time>'
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
