
//Onemogućavanje scroll-a
var $window = $(window);
var $body = $('body');

$window.disablescroll();

$window.load(function() {
	
	$('.global-wrap').imagesLoaded( function() { //Nakon što su se "podigle" sve slike u DOM
		setTimeout(function(){
			$('.global-wrap').css("visibility","visible"); //Otkrivanje global-a
			
			//FadeOut loader-a
			$(".loader-container").addClass("magictime vanishOut").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
				$(this).css("visibility","hidden");
			});
			
			$("body").removeClass("loader"); //Micanje loader klase sa body-a (Margin, background i overflow(scrollbar))
			$window.disablescroll("undo"); //Omogućavanje scroll-a
			
			//Postavlja scroller na top
			$('html, body').scrollTop(0);

		}, 3750);	
	});

});
 
//Document loaded
(function($) {
	'use strict';
	
	// Dodatak za svaki anchor link :)
	$('a[href^="#"]').on('click',function (e) {
	    e.preventDefault();
	
	    var target = this.hash;
	    var $target = $(target);
		
		$('#mainMenu a').each(function () {
            $(this).parent().removeClass('active');
        });	
		
		if(target == '#naslovna'){
			$('html, body').stop().animate({
				'scrollTop': 0
			}, 950, 'swing', function() {
				
				if ($(window).width() < 991 && $('.nav-main-collapse').hasClass('in')) { //Na mobilnoj verziji skriva meni
					$('.nav-main-collapse').collapse('hide');
				}
				
			});
		}
		else {
			$('html, body').stop().animate({
				'scrollTop': $target.offset().top - 50
			}, 950, 'swing', function () {
				
				//window.location.hash = target; //Ne stavlja se u putanju anchor
				$(this).parent().addClass('active');
				
				if ($(window).width() < 991 && $('.nav-main-collapse').hasClass('in')) {
					$('.nav-main-collapse').collapse('hide');
				}
				
			});
		}	
	});	
	
	//menuOnscroll init
	//Unutar klase isključen scroll, koristi se samo da se postavi 'active' na meniju
	$('#mainMenu').menuOnScroll({
		menuSelector: '.menu-item',
		headerOffset: 100
    });
	
	//Subscribe
	$("#subscribe-btn").click( function(){
		var sub = $("#newsletterEmail").val();
		var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm; //RegEx
		var alertStatus = $("#newsletterStatus");
		if(sub != ""){
		
			if(!reg.test(sub)){ //Regex filter
				alertStatus.html();
				alertStatus.html("Unesena adresa nije ispravna.");
				alertStatus.removeClass("alert-success").addClass("alert-danger").fadeIn('slow').show();
			}
			else{
				var ajax = ajaxObj( "POST", "/subscribe" );
				ajax.onreadystatechange = function() {
					if(ajaxReturn(ajax) == true) {
						if(ajax.responseText == "0"){ //Uspješan unos
							alertStatus.html();
							alertStatus.html("Uspješno ste dodani na našu mailing listu.");
							alertStatus.removeClass("alert-danger").removeClass("alert-warning").addClass("alert-success").fadeIn('slow').show();
						}
						if(ajax.responseText == "1"){ //Postojeći zapis
							alertStatus.html();
							alertStatus.html("Unesena adresa se već nalazi na našoj mailing listi.");
							alertStatus.removeClass("alert-success").removeClass("alert-danger").addClass("alert-warning").fadeIn('slow').show();
						}
						if(ajax.responseText == "2"){ //Greška
							alertStatus.html();
							alertStatus.html("Nažalost došlo je do pogreške prilikom pokušaja prijave.");
							alertStatus.removeClass("alert-success").removeClass("alert-warning").addClass("alert-danger").fadeIn('slow').show();
						}
					}
				}
				ajax.send("sub="+sub);
			}
			
		}
		
	});
	
	//E-mail
	$("#send-msg-email").click( function(){
	
	});
	
	var ua = detect.parse(navigator.userAgent);
	$('#browser-agent').text(ua.browser.family);
	
	var i,faded = 450;
	$("#s31").click( function(){
			//Zamjena
			$('#s31').css("display","none");
			$('#s32').css("display","inline-block");
			//Opisi
			hideit();
			display(3);
	});
	$("#s32").mouseleave( function(){
			$('#s32').css("display","none");
			$('#s31').css("display","inline-block");
			hideit();
			display(0);
	
	});
	$("#s21").click( function(){
			$('#s21').css("display","none");
			$('#s22').css("display","inline-block");
			hideit();
			display(2);
    });
	$("#s22").mouseleave( function(){	
			$('#s22').css("display","none");
			$('#s21').css("display","inline-block");
			hideit();
			display(0);
	});
	$("#s11").click( function(){
			$('#s11').css("display","none");
			$('#s12').css("display","inline-block");
			hideit();
			display(1);
	});
	$("#s12").mouseleave( function(){
			$('#s12').css("display","none");
			$('#s11').css("display","inline-block");
			hideit();
			display(0);
	});
	
	function hideit(){
		for (i = 0; i< 4; i++){
			$('#h'+i).attr('aria-hidden','true').hide();
		}
	}
	function display (num) {
		for (i = 0; i< 4; i++){	
			if (i == num){
				$('#h'+i).fadeIn(faded).attr('aria-hidden','false').show();
			}	
		}
		
	}
	
	//YT video-popup
	$('.popup-youtube').magnificPopup({
		disableOn: 700,
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,
		fixedContentPos: false
		/*callbacks: {
            close: function() {
				$window.disablescroll("undo");
			},
			open: function() {
				$window.disablescroll();
			}
        }*/
			
	});
		
	// Scroll to Top.
	if (typeof theme.PluginScrollToTop !== 'undefined') {
		theme.PluginScrollToTop.initialize();
	}

	// Parallax
	if (typeof theme.PluginParallax !== 'undefined') {
		theme.PluginParallax.initialize();
	}

	// Tooltips
	if ($.isFunction($.fn['tooltip'])) {
		$('[data-tooltip]').tooltip();
	}

}).apply(this, [jQuery]);

// Animate
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginAnimate'])) {

		$(function() {
			$('[data-plugin-animate], [data-appear-animation]').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginAnimate(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Carousel
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginCarousel'])) {

		$(function() {
			$('[data-plugin-carousel]:not(.manual), .owl-carousel:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginCarousel(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Chart.Circular
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginChartCircular'])) {

		$(function() {
			$('[data-plugin-chart-circular]:not(.manual), .circular-bar-chart:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginChartCircular(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Counter
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginCounter'])) {

		$(function() {
			$('[data-plugin-counter]:not(.manual), .counters [data-to]').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginCounter(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Flickr
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginFlickr'])) {

		$(function() {
			$('[data-plugin-flickr]:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginFlickr(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Lightbox
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginLightbox'])) {

		$(function() {
			$('[data-plugin-lightbox]:not(.manual), .lightbox:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginLightbox(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Masonry
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginMasonry'])) {

		$(function() {
			$('[data-plugin-masonry]:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginMasonry(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Progress Bar
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginProgressBar'])) {

		$(function() {
			$('[data-plugin-progress-bar]:not(.manual), [data-appear-progress-animation]').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginProgressBar(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Revolution Slider
(function($) {

	'use strict';

	if (($.isFunction($.fn['themePluginRevolutionSlider']))&&(screen.width >= 767)) {

		$(function() {
			$('[data-plugin-revolution-slider]:not(.manual), .slider-container .slider:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginRevolutionSlider(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Sort
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginSort'])) {

		$(function() {
			$('[data-plugin-sort]:not(.manual), .sort-source:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginSort(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Toggle
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginToggle'])) {

		$(function() {
			$('[data-plugin-toggle]:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginToggle(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Tweets
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginTweets'])) {

		$(function() {
			$('[data-plugin-tweets]:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginTweets(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Video Background
(function($) {

	'use strict';

	if ($.isFunction($.fn['themePluginVideoBackground'])) {

		$(function() {
			$('[data-plugin-video-background]:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginVideoBackground(opts);
			});
		});

	}

}).apply(this, [jQuery]);

//Word Rotate
(function($) {

	'use strict';

	if (($.isFunction($.fn['themePluginWordRotate']))&&(screen.width >= 991)) {

		$(function() {
			$('[data-plugin-word-rotate]:not(.manual), .word-rotate:not(.manual)').each(function() {
				var $this = $(this),
					opts;

				var pluginOptions = $this.data('plugin-options');
				if (pluginOptions)
					opts = pluginOptions;

				$this.themePluginWordRotate(opts);
			});
		});

	}

}).apply(this, [jQuery]);

// Commom Partials
(function($) {

	'use strict';

	// Sticky Menu
	if (typeof theme.StickyMenu !== 'undefined') {
		theme.StickyMenu.initialize();
	}

	// Search
	if (typeof theme.Search !== 'undefined') {
		theme.Search.initialize();
	}

	// Newsletter
	if (typeof theme.Newsletter !== 'undefined') {
		theme.Newsletter.initialize();
	}

	// Account
	if (typeof theme.Account !== 'undefined') {
		theme.Account.initialize();
	}

}).apply(this, [jQuery]);