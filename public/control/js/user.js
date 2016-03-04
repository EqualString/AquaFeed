
/**Komunikacija sa serverom**/	
var socket = io.connect();
var new_user =[];
var oldInfo = [];
var err = true;

var err2 = true; 
$(document).ready(function() { 
	socket.on('userData',function(data){
		oldInfo = data; 
		
		//Ubacivanje podataka
		add_info(data);
		
		//Ne aktiviran mail
		if( oldInfo[6] == '0' ){
		
			$('#status4').html('<p class="validation-error" style=""><i class="fa fa-exclamation-triangle"></i></p>');
			setTimeout(function(){ //Modal
				$('#modal-mail').text(oldInfo[2]);
				$('#modal-mail-not-activated').modal('show');
			},750);	
		} else {
			$('#status4').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i></p>');
		}	
		
	});
	
	msie();//Skriva checkbox
});				

					
/** -/- **/
function msie() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0){ //Ako je IE, onda sakrij checkbox, jer IE samo jednom postavlja input atribute
		$('#ie-checkbox').css("display","none");		
	}     
}

function add_info(data){

	$("#top-username").append('<span class="fa fa-user"></span> '+data[0]+'<span class="caret"></span>');
	$('#user-name').val(data[0]);	
	$('#old-pass').val();
	$('#email').text(data[2]);	
	$('#firstname').text(data[3]);	
	$('#lastname').text(data[4]);	
	$('#adress').text(data[5]);	
	
}
					
function save_info(){

	new_user[0] = document.getElementById('user_name').value;
	new_user[1] = document.getElementById('user_pass').value;
	socket.emit('change_user', new_user);
	$("#top-username").html("");
	$("#top-username").append('<span class="fa fa-user"></span> '+new_user[0]+'<span class="caret"></span>');
	$('#modal-succes').modal('show');
		
}

//Prikaz lozinki putem checkbox-a
$('#show-pass').change(function () {
    var oldPass = $('#old-pass');
	var newPass = $('#user-pass');
	
    var type = $(this).is(':checked') ? 'text' : 'password'; //Tip ovisan o checkboxu
	
	oldPass.attr('type', type );
	newPass.attr('type', type ); //ReplaceWith ne bi radio zbog keyup listenera
	
});

//Testiranje korisničkog imena
function checkname() {

		var tmn = $('#user-name').val();
		if( tmn === ""){
			$('#status1').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Ispunite polje.</p>');
			err = true;
		}
		if( tmn.length < 3){
			$('#status1').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 3 znaka.</p>');
			err = true;
		}
		else if ( tmn != "") {
			//$('#status1').html('<p class="validation-error" style="color:#7cc576; font-size:20px; margin-top:25px;"><i class="fa fa-spinner fa-pulse"></i></p>');	
			
				var ajax = ajaxObj( "POST", "/testUser" );
				//Primanje od strane php-a
				ajax.onreadystatechange = function() {
					if(ajaxReturn(ajax) == true) {
						if(ajax.responseText == "1"){ //Nedostupno
							$('#status1').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Postojeće ime.</p>');
							err = true;
						}
						if(ajax.responseText == "0"){ //Dostupno
							$('#status1').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i></p>');
							err = false;
						}
					}
				}
				ajax.send("testUsername="+tmn);
		}
		
}

//Provjera stare lozinke
function checkpass(){
	var oldPass = $('#old-pass').val();
	
	if ( oldPass == oldInfo[1] ){
		$('#status3').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i></p>');
		err2 = false;
	}else {
		$('#status3').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i></p>');
		err2 = true;
	}
}

//Testiranje lozinke					
$("#user-pass").on("keypress keyup keydown", function() {

	var ts1 = $(this).val();	
	if (ts1.length < 6) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 6 znakova.</p>');
		err = true;
    } else if (ts1.length > 50) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Max. 50 znakova.</p>');
		err = true;
    } else if (ts1.search(/\d/) == -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 1 broj.</p>');
		err = true;
    } else if (ts1.search(/[a-zA-Z]/) == -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 1 slovo.</p>');
		err = true;
    } else if (ts1.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Nedopušteni znak.</p>');
		err = true;
    } else{
		//Test "jačine" lozinke
		var pass_score = checkPassStrength(ts1);
		var pass_string = '<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i> Jakost: '+pass_score+'.</p>';
		$('#status2').html(pass_string);
		err = false;
	}				
									
});					