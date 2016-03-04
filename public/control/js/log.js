/**Komunikacija sa serverom**/
					
	var socket = io.connect();
	var zapis,zapisn=[];
	
	socket.on('log',function(data){
	
		zapis = data;
		create_log();
		
	});
					
	socket.on('real_log',function(data){
	
		zapis = data;
		create_log();
		
	});
					
	/** -/- **/
					
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
					
	/** -/- **/