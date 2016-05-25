	var socket = io.connect();
	var dd;

	window.onbeforeunload = function(e) {
		socket.close();
		socket.disconnect();
	};

	socket.on('times',function(timesData){ //Socket
		
		if(timesData==null){ //Test sesije (rješava problem sa "back" i cachingom)
			window.location = '/login';
		}
		dd = timesData;
		create_table();
		
		currentTime = moment().format('HH:mm');
		$("#input-date").val(currentTime);
		
		setTimeout( function(){	//Loader
			$('.loading-container').fadeOut(535, function() {
				$(this).remove();
				animInit();
			});
		},1570); 	
		
	});

	function saveTable (){

		resolve_table();
		var logTime = moment().format('DD/MM/YYYY HH:mm');
		dd.push(logTime); //Zadnja vrijednost je logTime
		socket.emit('times-update', dd ); //Slanje putem soceket-a server-u
		$('#modal-succes').modal('show');

	}

	/** Izgradnja tablice **/
	function create_table() {
		
		$("#tablebody").html(""); //Očisti tablicu
		dd.sort();
		var len = dd.length;
		for (var i=0;i<len;i++){
			$('#table-time1 > tbody:last-child').append(
				'<tr><td>'+(i+1)+'</td><td class="data">'+dd[i]+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
		}
		
	}
		
	function addRow (){
		
		var i = 0, same = false;
		var val = $("#input-date").val();
		
		$("#tablebody").find("tr").each(function() {
			if(val == dd[i]){
				same = true; //Ako postoji takav zapis
			}
			i++;
		});
		
		if ((val != "")&&(same == false)){ 
			i++;
			dd.push(val);
			$('#table-time1 > tbody:last-child').append(
				'<tr><td>'+i+'</td><td class="data">'+val+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
		}
		if (val == "") {
			$('#modal-failure').modal('show'); //Modal failure
		}
		
	}
		
	$("#delete_btn").on('click', function() { //Briše označene

		var checked = jQuery('input:checkbox:checked').map(function () {
			return this.value;
		 }).get();
		jQuery('input:checkbox:checked').parents("tr").remove();
		resolve_table();
		
	});

	function resolve_table(){
		
		var i = 0;
		dd = [];
		$("#tablebody").find("tr").each(function() { //Dohvaća sve redove
			dd[i] = $(this).find('.data').html(); 
			i++;
		});
		create_table();
		
	}