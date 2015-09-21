/** Email CP **/
function cleanError(){
		
	$('#title-error').val("");
	$('iframe').contents().find('.wysihtml5-editor').html("");
			
}
		
function sendError(){
			
	var title = $('#title-error').val();
	var html = $('iframe').contents().find('.wysihtml5-editor').html();
		
	if(html === "Tijelo poruke"){
		$('#modal-failure').modal('show');
	}	
	else{		
	$.ajax({
		type: "POST",
		url: "https://mandrillapp.com/api/1.0/messages/send.json",
		data: 	{
				'key': 'QrD7GlDdRKKIPlAOBlc4pg',
				'message': {
				'from_email': 'aegredzija.eftos@gmail.com',
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
	}
			
}