/** Komunikacija sa server-om **/

var bounceSpinner = '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';

$("#send-btn").click( function(){ 
	var status = $("#status");
	status.removeClass("alert-danger").addClass("alert-info");
	var indicator = $(".corner-indicator");
	var captcha = $(".g-recaptcha");
	var btn = $("#form-submits");
	var credentials = $("#credentials");
	
	var acc = $("#username").val();
	
	if (acc != ""){
		
		indicator.addClass("la-animate"); 
		status.html();
		status.html(bounceSpinner);
		
		var ajax = ajaxObj( "POST", "/password-reset-step-one" ); //Prvi korak
		ajax.onreadystatechange = function() {
			if(ajaxReturn(ajax) == true) {
				if(ajax.responseText == "1"){ //Podaci u redu
					
					setTimeout( function() {
						indicator.removeClass("la-animate");
						status.hide();
						status.removeClass("alert-danger").addClass("alert-info");
						status.html();
						status.html('Da bi uspješno promjenili lozinku morate nam još potvrditi da ste ljudsko biće.');
						btn.hide();
						credentials.hide();
						status.fadeIn('slow').show();
						captcha.fadeIn('slow').show();
					}, 1350);
					
				}
				if(ajax.responseText == "2"){ //Neispravni podaci
					
					setTimeout( function() {
						indicator.removeClass("la-animate");
						status.hide();
						status.removeClass("alert-info").addClass("alert-danger");
						status.html();
						status.html('Nažalost unesene podatke nismo uspjeli povezati sa postojećim korisnikom. Molimo pokušajte ponovo.');
						status.fadeIn('slow').show();
					}, 1350);
					
				}
			}
		}
		ajax.send("username="+acc);
		
	}
	

});

//Callback od reCaptche
var verifyCallback = function() {

	var status = $("#status");
	var indicator = $(".corner-indicator");
	var captcha = $("#captcha");
	var logTime = moment().format('DD/MM/YYYY HH:mm');
	
	indicator.addClass("la-animate"); 
	status.html();
	status.html(bounceSpinner);
	
	var acc = $("#username").val();
	
	var ajax = ajaxObj( "POST", "/password-reset-step-two" );
	ajax.onreadystatechange = function() {
		if(ajaxReturn(ajax) == true) {
			if(ajax.responseText == "1"){ //Uspješna promjena lozinke
					
				setTimeout( function() {
					indicator.removeClass("la-animate");
					status.hide();
					$(".g-recaptcha").hide();
					status.removeClass("alert-info").addClass("alert-success");
					status.html();
					status.html('Uspješno ste promijenili Vašu lozinku. Nova lozinka Vam je poslana putem Vaše e-mail adrese.<br></br>Vaš AquaFeed Tim.');
					status.fadeIn('slow').show();
						
				}, 1350);
					
			}
			if(ajax.responseText == "2"){ //Nesupješna promjena lozinke
					
				setTimeout( function() {
					indicator.removeClass("la-animate");
					status.hide();
					$(".g-recaptcha").hide();
					status.removeClass("alert-info").addClass("alert-danger");
					status.html();
					status.html('Nažalost došlo je do pogreške prilikom promjene vaše lozinke.<br>Vaš AquaFeed Tim.');
					status.fadeIn('slow').show();
				}, 1350);
					
			}
		}
	}
	ajax.send("user="+acc+"&logtime="+logTime);
	
}


