
var socket = io.connect();
var dd,izvedeni,iti;

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
	
		setTimeout( function(){	
		
			//Loader
			$('.loading-container').fadeOut(535, function() {
				$(this).remove();
			});
			
			izvedeni = data;
			startTime();
			//timeline();
			
		},1270); 	
		
	});

});

socket.on('jesam',function(data){
	izvedeni = data;
	timeline();
});

function timeline() {
	var done;
	var len = dd.length;
	var timeline = $('.tmtimeline')
						
	$("#timeline").html("");//Obriši
							
	for (var i=0;i<len;i++){
								
								
		if (izvedeni[i] == 1){ //Ako ima flag da je izveden
			done = "glyphicon-ok successed";
		}
		else {
			done = "glyphicon-remove waited";
		}
								
		$("#timeline").append('<li class="clearfix"><time class="tl-time"><h3 class="text-timeline">'
		+dd[i]+'</h3></time><i class="icon icon-fishes bg-timeline tl-icon text-white">'
		+'</i><div class="tl-content"><div class="panel panel-timeline"><div class="panel-body">'
		+(i+1)+'. Dnevno hranjenje </div></div><span class="label label-timeline">'
		+'<i class="glyphicon '+done+'"></i></span></div></li>');	
								
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
