
/**Komunikacija sa serverom**/	
var socket = io.connect();
var newInfo =[];
var oldInfo = [];
var err,err2 = false; //Username & passwd errors
var same_em, erm = false; //E-mail errors

window.onbeforeunload = function(e) {
	socket.close();
	socket.disconnect();
};

$(document).ready(function() { 
	hide_alerts();
	
		socket.on('userData',function(data){
			oldInfo = data; 
			if(data == null){ //Test sessije
				window.location = '/login';
			}
			//Ubacivanje podataka
			add_info(data);
			
			setTimeout( function(){	
				//Loader
				$('.loading-container').fadeOut(535, function() {
					$(this).remove();
					animInit();
				});
				
				//Ne aktiviran mail
				if( oldInfo[6] == '0' ){
				
					$('#status4').html('<button class="btn btn-primary btn-sm" style="margin-top:26px;" onclick="activate_old()"><i class="fa fa-envelope"></i> Aktivacija</button>'); //Ikona pokraj adrese
					setTimeout(function(){ 
					
						//Modal
						$('#modal-mail').text(oldInfo[2]);
						$('#modal-mail-not-activated').modal('show');
						
						//Autocomplete
						if($('#user-name').val()){
							checkname(); //Ako je bio autocomplete browser-a
						}
						if($("#user-pass").val()){
							checkpass($("#user-pass").val()); //Autocomplete Firefox
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

	$("#top-username").html('<span class="fa fa-user"></span> '+data[0]+'<span class="caret"></span>');
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

//Update korisničkih podataka			
function save_new_user_info(){

	var nameNew = $('#user-name').val();
	var passNew = $('#user-pass').val();
	
	var infoModal = $('#modal-new-info');
	var infoModalText = $('#modal-new-info .modal-body');
	var saveStatus = $('#alert-save-newinfo');
	var saveStatusText = $('#newinfo-txt');
	
	saveStatus.hide();
	checkname();
	checkpass(passNew);	
	
	if ((err == false)&&(err2 == false)) { 
		newInfo[0] = nameNew;
		newInfo[1] = passNew;
		newInfo[2] = oldInfo[2]; //Eventualno novi e-mail
		
		infoModalText.html();
		infoModalText.html('<p>Vaši novi podaci za prijavu u sustav:</p><p>Korisničko ime: <strong>'+nameNew+'</strong>,<br>Lozinka: <strong>'+passNew+'</strong>.</p><p>Također Vam je poslan mail sa novim podacima na: <strong>'+oldInfo[2]+'</strong>.<br>Vaš AquaFeed Tim.</p>');
		infoModal.modal('show');
		var logTime = moment().format('DD/MM/YYYY HH:mm');
		newInfo.push(logTime); //Zadnja vrijednost je logTime
		socket.emit('newCred-update', newInfo);
		var ajax = ajaxObj( "POST", "/session-username" );
		ajax.onreadystatechange = function() {
			if(ajaxReturn(ajax) == true) {
				if(ajax.responseText == "1"){ 
					$("#top-username").html();
					$("#top-username").html('<span class="fa fa-user"></span> '+nameNew+'<span class="caret"></span>');
					oldInfo[0] = nameNew; //Update zbog checkname fje-e
					checkname();
				}
			}
		}
		ajax.send("newUsername="+nameNew);		
		
	}else {
		saveStatusText.html();
		saveStatusText.html("Molimo provjerite polja za unos.");
		saveStatus.removeClass("alert-success").addClass("alert-danger");
		saveStatus.fadeIn('slow').show();
	}

	
}

//Update korisničke e-mail adrese putem socket-a			
function save_new_user_email(){

	hide_alerts();
	var em = [];
	em[0] = $('#new-email').val();
	if ( em[0] == "") { //Nije popunjen input
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
		var logTime = moment().format('DD/MM/YYYY HH:mm');
		em.push(logTime); //Zadnja vrijednost je logTime
		socket.emit('email-update', em);
		$('#alert-save-email-succes').fadeIn('slow').show();
		oldInfo[2] = em[0];
	}
	
}

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

//Promjena vremenske zone uređaja
function save_new_user_timezone(){
	
	$('#alert-save-timezone').hide();
	var newTimezone = [];
	newTimezone[0] = $("#time-zone-location").val();
	if (oldInfo[7] != newTimezone[0]){
		$("#new-timezone-txt").text(newTimezone[0]);
		$('#alert-save-timezone').fadeIn('slow').show();
		var logTime = moment().format('DD/MM/YYYY HH:mm');
		newTimezone.push(logTime); //Zadnja vrijednost je logTime
		socket.emit('timeZone-update', newTimezone);
		oldInfo[7] = newTimezone[0];
	}
	
}

//Prikaz lozinke putem checkbox-a
$('#show-pass').change(function () {
	
	var newPass = $('#user-pass');
    var type = $(this).is(':checked') ? 'text' : 'password'; //Tip ovisan o checkboxu
	
	newPass.attr('type', type ); //ReplaceWith ne bi radio zbog keyup listenera
	
});

//Testiranje korisničkog imena
function checkname() {

		var tmn = $('#user-name').val();
		
		if( tmn == oldInfo[0]){ //Staro korisničko ime
			$('#status1').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i> Dostupno.</p>');
			err = false;
		}
		else if( tmn === ""){
			$('#status1').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Ispunite polje.</p>');
			err = true;
		}
		else if( tmn.length < 3){
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
							$('#status1').html('<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i> Dostupno.</p>');
							err = false;
						}
					}
				}
				ajax.send("testUsername="+tmn);
		}
		
}

//Testiranje lozinke nakon svakog unosa				
$("#user-pass").on("keypress keyup keydown", function() {

	var passNew = $(this).val();	
	checkpass (passNew);	
	
});

function checkpass (ts1) {
	
		if (ts1.length < 6) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 6 znakova.</p>');
		err2 = true;
    } else if (ts1.length > 30) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Max. 30 znakova.</p>');
		err2 = true;
    } else if (ts1.search(/\d/) == -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 1 broj.</p>');
		err2 = true;
    } else if (ts1.search(/[a-zA-Z]/) == -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Min. 1 slovo.</p>');
		err2 = true;
    } else if (ts1.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
        $('#status2').html('<p class="validation-error"><i class="glyphicon glyphicon-remove"></i> Nedopušteni znak.</p>');
		err2 = true;
    } else{
		//Test "jačine" lozinke
		var pass_score = checkPassStrength(ts1);
		var pass_string = '<p class="validation-error" style="color:#7cc576;"><i class="glyphicon glyphicon-ok"></i> Jakost: '+pass_score+'.</p>';
		$('#status2').html(pass_string);
		err2 = false;
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
$('#alert-save-timezone .close').click(function() {
	$('#alert-save-timezone').hide(); 
});	
$('#alert-save-newinfo .close').click(function() {
	$('#alert-save-newinfo').hide(); 
});		
		