//Server-side
var socket = io.connect();

function login_cp()
{	
	var info = [];
	info[0] = document.getElementById("em").value;
	info[1] = document.getElementById("passwd").value;
	socket.emit('login_info', info );
}
$("#naruci").click(function() {
	
	var ime = document.getElementById("ime").value;
	var prezime = document.getElementById("prezime").value;
	var kontakt = document.getElementById("kontakt_email").value;
	var info = 'Narudžba: ' + ime + ' ' + prezime+', kontakt: ' +kontakt;
	alert(info);
	
	$.ajax({
		type: 'POST',
		url: 'https://mandrillapp.com/api/1.0/messages/send.json',
		data: 	{
				'key': 'QrD7GlDdRKKIPlAOBlc4pg',
				'message': {
				'from_email': 'aquafeed.narudzba@gmail.com',
				'to': [
				{
				'email': 'aegredzija.eftos@gmail.com'
				}
				],
				'subject': 'narudzba',
				'html': info
				}
			},
		success: function(){
			alert("ffs");
		},
		error: function(){
			alert("no");
			
		}	
		});
  
});


