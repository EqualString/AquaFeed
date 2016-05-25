/** Komunikacija sa server-om **/

var bounceSpinner = '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';

//Callback od reCaptche
var verifyCallback = function() {

	var status = $("#status");
	var indicator = $(".corner-indicator");
	var logTime = moment().format('DD/MM/YYYY HH:mm');
	
	indicator.addClass("la-animate"); 
	status.html();
	status.html(bounceSpinner);
	
	var acc = location.search.split('afmac=')[1]; //Dohvaćanje querry-a iz URL-a

	var ajax = ajaxObj( "POST", "/email-activation" );
	ajax.onreadystatechange = function() {
		if(ajaxReturn(ajax) == true) {
			if(ajax.responseText == "1"){ //Uspješna aktivacija
					
				setTimeout( function() {
					indicator.removeClass("la-animate");
					status.hide();
					$(".g-recaptcha").hide();
					status.removeClass("alert-info").addClass("alert-success");
					status.html();
					status.html('Uspješno ste aktivirali Vašu e-mail adresu.<br>Vaš AquaFeed Tim.');
					status.fadeIn('slow').show();
					setTimeout( function() {
						window.location = '/index'; //Redirect, jer je nemoguće POST -> POST na serveru
					}, 1650);	
				}, 2100);
					
			}
			if(ajax.responseText == "2"){ //Nesupješna aktivacija
					
				setTimeout( function() {
					indicator.removeClass("la-animate");
					status.hide();
					$(".g-recaptcha").hide();
					status.removeClass("alert-info").addClass("alert-danger");
					status.html();
					status.html('Nažalost došlo je do pogreške prilikom aktivacije.<br>Vaš AquaFeed Tim.');
					status.fadeIn('slow').show();
				}, 2100);
					
			}
			if(ajax.responseText == "3"){ //Adresa je vec aktivirana
					
				setTimeout( function() {
					indicator.removeClass("la-animate");
					status.hide();
					$(".g-recaptcha").hide();
					status.removeClass("alert-info").addClass("alert-warning");
					status.html();
					status.html('Vaša e-mail adresa je već aktivirana.<br>Vaš AquaFeed Tim.');
					status.fadeIn('slow').show();
					setTimeout( function() {
						window.location = '/index'; //Redirect
					}, 1650);	
				}, 2100);
					
			}
		}
	}
	ajax.send("user="+acc+"&logtime="+logTime);
	
}


