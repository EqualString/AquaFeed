/**Komunikacija sa serverom**/
					
					var socket = io.connect();
					var dd;
					
					socket.on('times',function(data){ //Socket
						dd = data;
						create_table();
					});
					
					function saveTable (){
					
						resolve_table();
						socket.emit('times-update', dd ); //Slanje putem soceket-a server-u
						$('#modal-succes').modal('show');
						
					}
					
					/** -/- **/
					
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
				
					/** -/- **/