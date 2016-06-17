/** Komunikacija sa server-om **/

var bounceSpinner = '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
var login_counter = 0;

//Login
$("#login-btn").click( function(){ 
	var indicator = $(".corner-indicator");
	var loginStatus = $("#login-status"); 
	var statusText = $("#status-text");
	var captcha = $(".g-recaptcha");
	var captchaStatus = $("#captcha-status");
	var credentials = $("#credentials");
	var formSubmits = $("#form-submits");
	
	var username = $("#username").val();
	var passwd = $("#passwd").val();
	var rememberMe = $("#rememberme").prop("checked");
	
	if ((username != "")&&(passwd != "")){
		
		indicator.addClass("la-animate"); 
		loginStatus.hide(); 
		loginStatus.addClass("alert-info").removeClass("alert-danger");
		statusText.html();
		statusText.html(bounceSpinner);
		loginStatus.fadeIn('slow').show();
		
		var ajax = ajaxObj( "POST", "/login-auth" );
		ajax.onreadystatechange = function() {
			if(ajaxReturn(ajax) == true) {
				if(ajax.responseText == "1"){ //Login
					
					setTimeout( function() {
						loginStatus.hide();
						indicator.removeClass("la-animate");
						loginStatus.removeClass("alert-info").addClass("alert-success");
						statusText.html();
						statusText.html('<span class="spinner"><i class="fa fa-check-circle fa-2x"></i></span>');
						loginStatus.fadeIn('slow').show();
						setTimeout( function() {
							window.location = '/timeline'; //Redirect, jer je nemoguće POST -> POST na serveru
						}, 1650);	
					}, 2100);
					
				}
				if(ajax.responseText == "2"){ //Nepostojeći korisnik
					
					setTimeout( function() {
						loginStatus.hide(); 
						loginStatus.removeClass("alert-info").addClass("alert-danger");
						statusText.html();
						statusText.html('<span>Nismo u mogućnosti pronaći traženog korisnika u našem sustavu.</span>');
						loginStatus.fadeIn('slow').show();
						indicator.removeClass("la-animate");
						login_counter ++;
						if(login_counter == 3){ captchaShow(); }
					}, 2100);
					
				}
				if(ajax.responseText == "3"){ //Neodgovarajuća lozinka
					
					setTimeout( function() {
						loginStatus.hide(); 
						loginStatus.removeClass("alert-info").addClass("alert-danger");
						statusText.html();
						statusText.html('<span>Nažalost unesena lozinka ne odgovara traženom korisničkom računu.</span>');
						loginStatus.fadeIn('slow').show();
						indicator.removeClass("la-animate");
						login_counter ++;
						if(login_counter == 3){ captchaShow(); }
					}, 2100);
					
				}
			}
		}
		ajax.send("username="+username+"&passwd="+passwd+"&rememberme="+rememberMe);
		
		function captchaShow(){
			loginStatus.hide(); 
			credentials.hide();
			formSubmits.hide();
			captchaStatus.fadeIn('slow').show();
			captcha.fadeIn('slow').show();
		}
	}
});

//Callback od reCaptche
var verifyCallback = function() {
	$(".g-recaptcha").hide();
	$("#captcha-status").hide();
	$("#credentials").fadeIn('slow').show();
	$("#form-submits").fadeIn('slow').show();
	login_counter = 0;
	grecaptcha.reset(); //Resetira captchu, prima id od widgeta, ali ako ne, onda resetira prvi widget
}

//Skrivanje alert-a
$('#login-status .close').click(function() {
	$("#login-status").hide(); 
});

