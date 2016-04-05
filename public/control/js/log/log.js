	
	var socket = io.connect();
	var zapis = [];
	
	$(window).on('beforeunload', function(){
		socket.close();
		socket.disconnect();
	});	

	socket.on('log',function(data){
		zapis = data;
		create_log();
		setTimeout( function(){	
			//Loader
			$('.loading-container').fadeOut(535, function() {
				$(this).remove();
			});
		},1570); 
	});
	
	socket.on('real_log',function(data){
		zapis = data;
		create_log();
	});
	
	function create_log(){
	
		$("#log_area").val('');
		
		var i = 0;
		var len = zapis.length;
		var logtext='';
		
		for (var i=0;i<len;i++){
			logtext = logtext + zapis[i] + '\n';
		}
		
		$("#log_area").val(logtext);
	}
	
	function saveLogData(){
		var logData = $("#log_area").val();
		logData = logData.replace(/([>\r\n]?)(\r\n|\n\r|\r|\n)/g, '\r\n'); //Zamjena zbog ispisa u datoteci: '\n' -> '\n\r'
		var blob = new Blob([logData], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "AF_log.txt");
	}
	