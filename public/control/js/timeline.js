					/**Komunikacija sa serverom**/	
					var socket = io.connect();
					var dd,done,izvedeni,iti;
					
					socket.on('datumi',function(data){
						dd = data;
						var len = dd.length;
						
						if( len <= 1){
							$("#heading").append('<i class="fa fa-clock-o"></i> Imate '+len+'. događaj koji se izvodi svakodnevno.');
						}
						else{
							$("#heading").append('<i class="fa fa-clock-o"></i> Imate '+len+'. događaja koji se izvode svakodnevno.');
						}
						
						startTime();
						socket.on('izvoz',function(data){
							izvedeni = data;
							create_timeline();
						});
					});
					
					socket.on('jesam',function(data){
						izvedeni = data;
						create_timeline();
					});
					/** -/- **/
					
					/** Izgradnja timeline-a **/
					function create_timeline() {
						var len = dd.length;
						
						$("#timeline").html("");//Obriši
							
							for (var i=0;i<len;i++){
								
								
								if (izvedeni[i] == true){ //Ako ima flag da je izveden
									done = "glyphicon-ok successed";
								}
								else {
									done = "glyphicon-remove waited";
								}
								
								$("#timeline").append('<li class="clearfix"><time class="tl-time"><h3 class="text-timeline">'
								+dd[i]+'</h3></time><i class="icon icon-fishes bg-timeline tl-icon text-white">'
								+'</i><div class="tl-content"><div class="panel panel-timeline"><div class="panel-body">'
								+(i+1)+'. Dnevno hranjenje </div></div><span class="label label-timeline">'
								+'<i class="glyphicon '+done+'"></i></span></div></li>');	
								
							}
					}
					function startTime() {
						var today=new Date();
						var hh=today.getHours();
						var mn=today.getMinutes();
						if(hh<10) {
							hh='0'+hh;
						} 
						if(mn<10) {
							mn='0'+mn;
						}
						
						$('#live-clock').val(hh+":"+mn);
						var t = setTimeout(function(){startTime()},60000);
					}
					function nahrani_sada (){
						
						socket.emit('nowfeed');
						$('#modal-succes').modal('show');
					}