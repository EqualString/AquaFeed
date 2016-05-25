/*
* Funkcije koje služe za :
*  - povezivanje na SendGrid API (Slanje e-mailova)
*  - enkripcija tajnim stringom
*  - slanje REST zahtjeva na worker app
*/

var sendgrid  = require('sendgrid')('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');
var http_request = require('request');
var crypto = require('crypto');

module.exports = { 

	//Slanje aktivacijskog maila na trenutni kontakt mail
    sendActivationMail : function( destination, userId ) { 
		
		var encryptedLink = 'http://localhost:8080/activation-mail?&afmac='+encrypt(userId.toString());
		sendgrid.send({
		  to:       destination,
		  from:     'AquaFeed@linuxmail.org',
		  subject:  'Aktivacijski e-mail',
		  html: '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="content-type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0;"><meta name="format-detection" content="telephone=no"/><style>/* Reset styles */  body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important;} body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%; } table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; } img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; } #outlook a { padding: 0; } .ReadMsgBody { width: 100%; } .ExternalClass { width: 100%; } .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; } /* Rounded corners for advanced mail clients only */  @media all and (min-width: 560px) { 	.container { border-radius: 8px; -webkit-border-radius: 8px; -moz-border-radius: 8px; -khtml-border-radius: 8px; } } /* Set color for auto links (addresses, dates, etc.) */  a, a:hover { 	color: #FFFFFF; } .footer a, .footer a:hover { 	color: #828999; }</style><title>AquaFeed aktivacijski e-mail</title></head><!-- BODY --><body topmargin="0" rightmargin="0" bottommargin="0" leftmargin="0" marginwidth="0" marginheight="0" width="100%" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%; 	background-color: #127DB3; 	color: #FFFFFF;" 	bgcolor="#127DB3" 	text="#FFFFFF"><!-- SECTION / BACKGROUND --><table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%;" class="background"><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;" 	bgcolor="#127DB3"><!-- WRAPPER --><table border="0" cellpadding="0" cellspacing="0" align="center" 	width="500" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit; 	max-width: 500px;" class="wrapper"><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;	padding-top: 20px;	padding-bottom: 20px;"><!--  --><a target="_blank" style="text-decoration: none;"	href="http://aquatest-testfeed.rhcloud.com/"><img border="0" vspace="0" hspace="0"	src="http://i430.photobucket.com/albums/qq29/EqualString/top_zpsuog6ks9r.png"	width="160" height="40"	alt="" title="" style="	color: #FFFFFF;	font-size: 10px; margin: 0; padding: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: block;" /></a></td></tr><!-- HERO IMAGE --><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;	padding-top: 0px;" class="hero"><a target="_blank" style="text-decoration: none;"><img border="0" vspace="0" hspace="0"	src="http://i430.photobucket.com/albums/qq29/EqualString/settings-block_zpsqu7azhjj.png"	alt="" title=""	width="340" style="	width: 87.5%;	max-width: 340px;	color: #FFFFFF; font-size: 13px; margin: 0; padding: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: block;"/></a></td></tr><!-- HEADER --><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;  padding-top: 27px; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 24px; font-weight: bold; line-height: 130%;	color: #FFFFFF;	font-family: sans-serif;" class="header">Aktivacijski&nbsp;e-mail</td></tr><!-- PARAGRAPH --><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;	padding-top: 15px; 	color: #FFFFFF;	font-family: sans-serif;" class="paragraph">Na korak ste do uspješne aktivacije Vaše e-mail adrese.<br>Vaš AquaFeed Tim.</td></tr><!-- BUTTON --><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;	padding-top: 25px;	padding-bottom: 5px;" class="button"><a	href="'+encryptedLink+'" target="_blank" style="text-decoration: none;"><table border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 240px; min-width: 120px; border-collapse: collapse; border-spacing: 0; padding: 0;"><tr><td align="center" valign="middle" style="padding: 12px 24px; margin: 0; text-decoration: none; border-collapse: collapse; border-spacing: 0; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; -khtml-border-radius: 4px;"	bgcolor="#E9703E"><a target="_blank" style="text-decoration: none;	color: #FFFFFF; font-family: sans-serif; font-size: 17px; font-weight: 400; line-height: 120%;"	href="'+encryptedLink+'">Aktivacija&nbsp;→</a></td></tr></table></a></td></tr><!-- LINE --><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;	padding-top: 30px;" class="line"><hr	color="#F0F0F0" align="center" width="100%" size="1" noshade style="margin: 0; padding: 0;" /></td></tr><!-- FOOTER --><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;	padding-top: 20px;	padding-bottom: 0px;"><!--  --><a target="_blank" style="text-decoration: none;"><img border="0" vspace="0" hspace="0"	src="http://i430.photobucket.com/albums/qq29/EqualString/footer_zpsvfx7trxe.png"	width="60" height="50"	alt="" title="" style="	color: #FFFFFF;	font-size: 10px; margin: 0; padding: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: block;" /></a></td></tr><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 13px; font-weight: 400; line-height: 150%;	padding-top: 10px;	padding-bottom: 20px;	color: #F0F0F0;	font-family: sans-serif;" class="footer">Vukovarska 72, 31000 Osijek Croatia<br>© 2016 AquaFeed</td></tr><!-- End of WRAPPER --></table><!-- End of SECTION / BACKGROUND --></td></tr></table></body></html>'
		}, function(err, json) {
		  if (err) { return console.error(err); }
		  //console.log(json);
		});
	},
	//Dekripcija id-a
	decryptID : function (req, res, next){
	
		res.locals.user = decrypt(req.body.user); //Dekripcija
		var regEx = /^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/g; //Regularni izraz za provjeru id-a (mora biti broj)
		
		if(res.locals.user == null){
			res.send('2'); //Neispravno kodiran string
			res.end();
		}
		else if ( regEx.test(res.locals.user) ){ //Regex test
			next();
		} 
		else{
			res.send('2'); //Nije broj
			res.end();
		}
	
	},
	//Proslijeđivanje zahtjeva za trenutnim hranjenjem na worker
	sendNowFeedRequest : function ( userID ) {
		
		//Header za POST
		var headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		};
		//Slanje zahtjeva za trenutno hranjenje za određeni ID korisnika
		http_request.post("http://localhost:8074/api/control", {form: {key: userID}, headers: headers}); 
		
	}
};

//Funkcije za kriptiranje/dekriptiranje querry URL-a
function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','bluefish12')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc','bluefish12')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}