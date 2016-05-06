var socket = io.connect();

window.onbeforeunload = function(e) {
	socket.close();
	socket.disconnect();
};

socket.on('userData',function(data){
	
	if(data==null){ //Test sesije
		window.location = '/login';
	}
	
	var adress = data[2];
	$("#sender").val(adress);
	
	setTimeout( function(){	
		
		//Loader
		$('.loading-container').fadeOut(535, function() {
			$(this).remove();
			animInit();
		});
		
	},1270); 	
	
});	

/** Email CP **/
function cleanMail(){
	
	$("#sender").val("");
	$('#title-mail').val("");
	$('iframe').contents().find('.wysihtml5-editor').html("");
	
}
		
function sendMail(){
			
	/*var sender1 = $("#sender1").val();
	var sender2 = $("#sender2").val();
	var sender = sender1 + '@' + sender2;
	var title = $('#title-mail').val();
	var html = $('iframe').contents().find('.wysihtml5-editor').html();
		
	if(sender == null || sender == "" || html === "Tijelo poruke"){
		$('#modal-failure').modal('show');
	}	
	else{		
	$.ajax({
		type: "POST",
		url: "https://mandrillapp.com/api/1.0/messages/send.json",
		data: 	{
				'key': 'QrD7GlDdRKKIPlAOBlc4pg',
				'message': {
				'from_email': sender,
				'to': [
				{
				'email': 'aegredzija.eftos@gmail.com'
				}
				],
				'subject': title,
				'html': html
				}
			},
		success: function(){
			$('#modal-succes').modal('show');
		},
		error: function(){
			$('#modal-failure').modal('show');
		}	
		});
	}*/
			
}