/** Animacija za logo i text **/
(function() {

	logo = document.querySelector('.login-header  i'); //Logo
	form = document.querySelector('.login'); //Forma
	
	//Opcije Animacije za tekst
	var options = 
		{ 	
			size : 75,
			weight : 10,
			color: '#f6f6f6',
			duration: 0.7,
			fade: 0.7,
			delay: 0.55,
			easing: d3_ease.easeSinInOut.ease
		};
	
	function init() {
		
			var word = document.querySelector('.list__text'), //Tekst (aquafeed)
				
				// inicijalizacija plugina
				instance = new Letters(word, options),
				endPlayCallback = function() {
					//Zbog performansi koristimo classie umjesto jquerry-a (Vanilla JS)
					classie.add(logo, 'fade_in_logo');
					logo.style.opacity = '1';
					setTimeout(function(){ //Prikaz forme sa zadrškom
						form.style.display = 'block';
						classie.add(form, 'fade_in_form');
						form.style.opacity = '1';
					}, 765);	
				};
			
				// prikaz riječi
				instance.showInstantly();
		
				//Započni animaciju
				word.style.opacity = '1'; //Fix da se prvo ne pokaže text prije nego SVG slova
				instance.hideInstantly();
				instance.show({callback : endPlayCallback}); //Callback na završnu fj-u (prikaz log-a)
				
		}
	
	init(); //Poziv glavne funkcije

})();
