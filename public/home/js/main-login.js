/** Komunikacija sa server-om **/

var bounceSpinner = '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';

//Login
$("#login-btn").click( function(){ 

	var loginStatus = $("#login-status"); 
	var statusText = $("#status-text");
	
	var username = $("#username").val();
	var passwd = $("#passwd").val();
	
	if ((username != "")&&(passwd != "")){
		
		loginStatus.hide(); 
		loginStatus.addClass("alert-info").removeClass("alert-danger");
		statusText.html();
		statusText.html(bounceSpinner);
		loginStatus.fadeIn('slow').show();
		
		var ajax = ajaxObj("POST", "/login-auth");
		ajax.onreadystatechange = function() {
			if(ajaxReturn(ajax) == true) {
				if(ajax.responseText == "1"){ //Login
					
					setTimeout( function() {
						loginStatus.hide();
						loginStatus.removeClass("alert-info").addClass("alert-success");
						statusText.html();
						statusText.html('<span class="spinner"><i class="fa fa-check-circle fa-2x success"></i></span>');
						loginStatus.fadeIn('slow').show();
						window.location = '/index'; //Redirect, jer je nemoguće POST -> POST na serveru
					}, 1750);
					
				}
				if(ajax.responseText == "2"){ //Nepostojeći korisnik
					
					setTimeout( function() {
						loginStatus.hide(); 
						loginStatus.removeClass("alert-info").addClass("alert-danger");
						statusText.html();
						statusText.html('<span>Nismo u mogućnosti pronaći traženog korisnika u našem sustavu.</span>');
						loginStatus.fadeIn('slow').show();
					}, 1750);
					
				}
				if(ajax.responseText == "3"){ //Neodgovarajuća lozinka
					
					setTimeout( function() {
						loginStatus.hide(); 
						loginStatus.removeClass("alert-info").addClass("alert-danger");
						statusText.html();
						statusText.html('<span>Nažalost unesena lozinka ne odgovara traženom korisničkom računu.</span>');
						loginStatus.fadeIn('slow').show();
					}, 1750);
					
				}
			}
		}
		ajax.send("username="+username+"&passwd="+passwd);
		
	}
});

//Skrivanje alert-a
$('#login-status .close').click(function() {
	$("#login-status").hide(); 
});