(function() {

	/**
	 * Vraća random broj između min i max
	 */
	function randomIntFromInterval(min,max) {
		return Math.floor(Math.random()*(max-min+1)+min);
	}

	
	logo = $(".loader-logo"); //Logo
	
	//Opcije Animacije
	var options = 
		{ 	
			size : 200,
			weight : 10,
			color: '#f6f6f6',
			duration: 1.9,
			fade: 2,
			delay: 0.1,
			easing: d3_ease.easeExpInOut.ease
		};
	
	function init() {
		
			var word = document.querySelector('.list__text'),
				
				// inicijalizacija plugina
				instance = new Letters(word, options),
				endPlayCallback = function() {
					logo.addClass("fade_in_logo").css("opacity","1"); //Dodaje animaciju i zatim zadržava opacity
					word.setAttribute('data-state', 'stop');
				};
			
			// prikaz riječi
			instance.showInstantly();
			
			// moo.js konfiguracija
			var timelines = {};
			
				var letters = [].slice.call(word.querySelectorAll('svg')),
					wordRect = word.getBoundingClientRect(),
					wordWidth = wordRect.width,
					wordHeight = wordRect.height,
					letterOffsetPosition = 0;
				
				timelines[1] = new mojs.Timeline();
				
				letters.forEach(function(letter, i) {
					var letterRect = letter.getBoundingClientRect(),
						letterWidth = letterRect.width,
						letterHeight = letterRect.height,
						letterWidthPercentage = letterWidth*100/wordWidth;
					
					letterOffsetPosition += letterWidthPercentage;

					var burst = new mojs.Burst({
						parent: word,
						duration: 1800,
						delay: 1000 + 115*i,
						shape : 'circle',
						fill : '#f6f6f6',
						x: letterOffsetPosition + '%',
						y: randomIntFromInterval(20, 80) + '%',
						childOptions: { 
							radius: {'rand(90,20)':0} 
						},
						radius: {50:160},
						opacity: 0.3,
						count: randomIntFromInterval(5,20),
						isSwirl: true,
						isRunLess: true,
						easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
					});
					
					timelines[1].add(burst);
					
				});
							
				
				//Započni animaciju
				word.style.opacity = '1'; //Fix da se prvo ne pokaže text prije nego SVG slova
				instance.hideInstantly();
				timelines[1].start();
				instance.show({callback : endPlayCallback}); //Callback na završnu fj-u (prikaz log-a)
				
		}
	
	init(); //Poziv glavne funkcije

})();
