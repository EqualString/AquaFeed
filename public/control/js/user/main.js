
/**Komunikacija sa serverom**/	
var socket = io.connect();
var newInfo =[];
var oldInfo = [];
var err,err2,err2 = false; //Usernam & passwd errors
var same_em, erm = false; //E-mail errors


$(document).ready(function() { 
	hide_alerts();
	
		socket.on('userData',function(data){
			oldInfo = data; 
			//Ubacivanje podataka
			add_info(data);
			setTimeout( function(){	
				//Loader
				$('.loading-container').fadeOut(535, function() {
					$(this).remove();
				});
				
				//Ne aktiviran mail
			if( oldInfo[6] == '0' ){
			
				$('#status4').html('<button class="btn btn-primary btn-sm" style="margin-top:26px;" onclick="activate_old()"><i class="fa fa-envelope"></i> Aktivacija</button>'); //Ikona pokraj adrese
				setTimeout(function(){ 
				
					//Modal
					$('#modal-mail').text(oldInfo[2]);
					$('#modal-mail-not-activated').modal('show');
					
					//Firefox autocomplete, automatski popuni input lozinke nakon verzije 38!
					if ( $('#old-pass').val() == oldInfo[1] ){
						
						$('#status3').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i></p>');
						err2 = false;
						
					}
					
				},750);	
				
			} else {
				$('#status4').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i></p>');
			}	
			
			},1570); 
			
			
			
		});
		
		msie();//Skriva checkbox ako je IE
	
});				

					
/** -/- **/
function msie() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0){ //Ako je IE, onda sakrij checkbox, jer IE samo jednom postavlja input atribute
		$('#ie-checkbox').css("display","none");		
	}     
}

function hide_alerts(){
	//Skrivanje alerta
	$('#alert-save-email-succes').hide();
	$('#alert-save-email-error').hide();
	$('#alert-save-email-warning').hide();
	$('#alert-activate-email-succes').hide();
}
function add_info(data){

	$("#top-username").append('<span class="fa fa-user"></span> '+data[0]+'<span class="caret"></span>');
	$('#user-name').val(data[0]);
	$('#email').text(data[2]);	
	$('#firstname').text(data[3]);	
	$('#lastname').text(data[4]);	
	$('#adress').text(data[5]);	
	$('#show-pass').prop('checked', false);
	//TimeZone
	var zone = data[7].split("/");
	$('#time-zone-region').val(zone[0]);
	$('#time-zone-region').trigger('chosen:updated');
	populateLocation();
	populateLocationOnLoad(data[7]);
}

//Aktivacija trenutne adrese
function activate_old(){
	
	socket.emit('sendCurActMail'); //Slanje putem socket-a server-u
	$('#modal-mail-not-activated').modal('hide');
	$('#new-email-show').css("display","none");
	$('#sended-mail').css("display","block");
	$('#alert-activate-email-succes').fadeIn('slow').show();
	$('#status4').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i></p>');
	$('#cur-mail').text(oldInfo[2]);
	$('#modal-succes').modal('show');

}		

//Update korisničke e-mail adrese putem socket-a			
function save_new_user_info(){

	hide_alerts();
	var name = $('#user-name').val();
	var passOld = $('#old-pass').val();
	var passNew = $('#user-pass').val();
	
	if (( passNew == "")&&(passOld != "")&&(err == false)&&(err2 == false)) { //Unesena dobra stara lozinka, nova lozinka => prazna, update korisničkog imena
		
	}
	if ( erm == true){ //Postoji greška
		$('#alert-save-email-error').fadeIn('slow').show();
	} else if (same_em == true){ //Unesena jednaka adresa
		$('#alert-save-email-warning').fadeIn('slow').show();
	} else { //Update adrese
		socket.emit('email-update', em);
		$('#alert-save-email-succes').fadeIn('slow').show();
	}
	
}

//Update korisničke e-mail adrese putem socket-a			
function save_new_user_email(){

	hide_alerts();
	var em = $('#new-email').val();
	if ( em == "") { //Nije popunjen input
		$('#status5').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i><p>'); //Prazan
		$('#alert-save-email-error .error-txt').text('Niste popunili traženo polje.');
		$('#alert-save-email-error').fadeIn('slow').show();
		erm = true;
	}
	if ( erm == true){ //Postoji greška
		$('#alert-save-email-error').fadeIn('slow').show();
	} else if (same_em == true){ //Unesena jednaka adresa
		$('#alert-save-email-warning').fadeIn('slow').show();
	} else { //Update adrese
		socket.emit('email-update', em);
		$('#alert-save-email-succes').fadeIn('slow').show();
	}
	
}

//Skrivanje alert-a
$('#alert-save-email-succes .close').click(function() {
	$('#alert-save-email-succes').hide(); 
});
$('#alert-activate-email-succes .close').click(function() {
	$('#sended-mail').css("display","none"); 
});
$('#alert-save-email-error .close').click(function() {
	$('#alert-save-email-error').hide(); 
});
$('#alert-save-email-warning .close').click(function() {
	$('#alert-save-email-warning').hide(); 
});

//Prikaz lozinki putem checkbox-a
$('#show-pass').change(function () {
    var oldPass = $('#old-pass');
	var newPass = $('#user-pass');
	
    var type = $(this).is(':checked') ? 'text' : 'password'; //Tip ovisan o checkboxu
	
	oldPass.attr('type', type );
	newPass.attr('type', type ); //ReplaceWith ne bi radio zbog keyup listenera
	
});

//Testiranje novog maila
function checkemail() {
	
	var em = $('#new-email').val();
	var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm; //RegEx
	
	if( em === ""){
		$('#status5').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i><p>'); //Prazan
		$('#alert-save-email-error .error-txt').text('Niste popunili traženo polje.');
		erm = true;
	} else if ( !reg.test(em) ){
		$('#status5').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i><p>'); //Neispravan
		$('#alert-save-email-error .error-txt').text('Niste unijeli ispravnu adresu.');
		erm = true;
	} else if ( em == oldInfo[2]){
		$('#status5').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i><p>'); //Isti 
		same_em = true;
	} else{
		
		var ajax = ajaxObj( "POST", "/testEmail" );
		ajax.onreadystatechange = function() {
			if(ajaxReturn(ajax) == true) {
				if(ajax.responseText == "1"){ //Nedostupno
					$('#status5').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i></p>');
					$('#alert-save-email-error .error-txt').text('Unijeli ste već postojeću adresu u sustavu!');
					erm = true;
				}
				if(ajax.responseText == "0"){ //Dostupno
					$('#status5').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i></p>');
					erm = false;
				}
			}
		}
		ajax.send("testEmail="+em);
	
	}
	
}

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
			
				var ajax = ajaxObj( "POST", "/testUser" );
				//Primanje od strane servera
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
		err3 = true;
    } else if (ts1.length > 50) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Max. 50 znakova.</p>');
		err3 = true;
    } else if (ts1.search(/\d/) == -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 1 broj.</p>');
		err3 = true;
    } else if (ts1.search(/[a-zA-Z]/) == -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 1 slovo.</p>');
		err3 = true;
    } else if (ts1.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Nedopušteni znak.</p>');
		err3 = true;
    } else{
		//Test "jačine" lozinke
		var pass_score = checkPassStrength(ts1);
		var pass_string = '<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i> Jakost: '+pass_score+'.</p>';
		$('#status2').html(pass_string);
		err3 = false;
	}				
									
});					