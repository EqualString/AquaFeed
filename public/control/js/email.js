/** Email CP **/
function cleanMail(){
		
	$("#sender1").val("");
	$("#sender2").val("");
	$('#title-mail').val("");
	$('iframe').contents().find('.wysihtml5-editor').html("");
			
}
		
function sendMail(){
			
	var sender1 = $("#sender1").val();
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
	}
			
}