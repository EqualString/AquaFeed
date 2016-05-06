//Opcije Animacije za tekst
var options = 
	{ 	
		size : 45,
		weight : 10,
		color: '#428bca',
		duration: 0.6,
		fade: 0.6,
		delay: 0.55,
		easing: d3_ease.easeSinInOut.ease
	};
	
function animInit() {
	
	var word = document.querySelector('.logo-text'), //Tekst (aquafeed)
	
	// inicijalizacija plugina
	instance = new Letters(word, options),
	endPlayCallback = function() {
		//word.style.display = 'none';
	};

	// prikaz riječi
	instance.showInstantly();

	//Započni animaciju
	word.style.opacity = '1'; //Fix da se prvo ne pokaže text prije nego SVG slova
	instance.hideInstantly();
	instance.show({callback : endPlayCallback}); //Callback na završnu fj-u (prikaz log-a)

}

$(".apps-small").click(function(){
	$(this).toggleClass("open navicon-open");
});


$(function(){
	
	
	
	/********************************
	popover
	********************************/
	if( $.isFunction($.fn.popover) ){
	$('.popover-btn').popover();
	}
	
	/********************************
	tooltip
	********************************/
	if( $.isFunction($.fn.tooltip) ){
	$('.tooltip-btn').tooltip()
	}
	
	/********************************
	NanoScroll - fancy scroll bar
	********************************/
	if( $.isFunction($.fn.niceScroll) ){
	$(".nicescroll").niceScroll({
	
		cursorcolor: '#9d9ea5',
		cursorborderradius : '0px'		
		
	});
	}
	
	if( $.isFunction($.fn.niceScroll) ){
	$("aside.left-panel:not(.collapsed)").niceScroll({
		cursorcolor: '#8e909a',
		cursorborder: '0px solid #fff',
		cursoropacitymax: '0.5',
		cursorborderradius : '0px'	
	});
	}

	/********************************
	Input Mask
	********************************/
	if( $.isFunction($.fn.inputmask) ){
		$(".inputmask").inputmask();
	}
	
	/********************************
	TagsInput
	********************************/
	if( $.isFunction($.fn.tagsinput) ){
		$('.tagsinput').tagsinput();
	}
	
	/********************************
	Chosen Select
	********************************/
	if( $.isFunction($.fn.chosen) ){
		$('#time-zone-region').chosen({disable_search_threshold: 7});
		$('#time-zone-location').chosen({disable_search_threshold: 7});
	}
	
	/********************************
	DateTime Picker
	********************************/
	if( $.isFunction($.fn.datetimepicker) ){
		
		$('#datetimepicker').datetimepicker({
			format: 'DD/MM/YYYY HH:mm'
		});
	
		$('#datepicker').datetimepicker({pickTime: false});
		$('#timepicker').datetimepicker({
			format: 'HH:mm'
		});
		
		$('#datetimerangepicker1').datetimepicker();
		$('#datetimerangepicker2').datetimepicker();
		$("#datetimerangepicker1").on("dp.change",function (e) {
		   $('#datetimerangepicker2').data("DateTimePicker").setMinDate(e.date);
		});
		$("#datetimerangepicker2").on("dp.change",function (e) {
		   $('#datetimerangepicker1').data("DateTimePicker").setMaxDate(e.date);
		});
	}
	 
	
	/********************************
	wysihtml5
	********************************/
	if( $.isFunction($.fn.wysihtml5) ){
		$('.wysihtml').wysihtml5();
	}
	
	/********************************
	wysihtml5
	********************************/
	if( $.isFunction($.fn.ckeditor) ){
	CKEDITOR.disableAutoInline = true;
	$('#ckeditor').ckeditor();
	$('.inlineckeditor').ckeditor();
	}

	/********************************
	Scroll To Top
	********************************/
	$('.scrollToTop').click(function(){
		$('html, body').animate({scrollTop : 0},800);
		return false;
	});
	
});

/********************************
Toggle Full Screen
********************************/

function toggleFullScreen() {
	if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
		if (document.documentElement.requestFullScreen) {
			document.documentElement.requestFullScreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullScreen) {
			document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}
}

//Onemogućuje povezivanje na 'lažni' link, tj. na '#'
[].slice.call( document.querySelectorAll('a[href="#"') ).forEach( function(el) {
	el.addEventListener( 'click', function(ev) { ev.preventDefault(); } );
});

