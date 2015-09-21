/**Komunikacija sa serverom**/
					
					var socket = io.connect();
					var dd;
					socket.on('datumi',function(data){
						dd = data;
						create_table();
					});
					function saveTable (){
						dd.sort(); //Sort vrijednosti
						socket.emit('table_data', dd );
						$('#modal-succes').modal('show');
					}
					
					/** -/- **/
					
					/** Izgradnja tablice **/
					function create_table() {
					
						$("#tablebody").html("");//Obriši
						var len = dd.length;
						for (var i=0;i<len;i++){
							$('#table-time1 > tbody:last-child').append(
							'<tr><td>'+(i+1)+'</td><td class="data">'+dd[i]+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
						}
					}
		
					function addRow (){
						var i=0;
						$("#tablebody").find("tr").each(function() { 
							i++;
						});
						var val = $("#input-date").val();
						if (val != ""){
							i++;
							dd.push(val);
							$('#table-time1 > tbody:last-child').append(
							'<tr><td>'+i+'</td><td class="data">'+val+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
						}
						else {
						$('#modal-failure').modal('show');
						}
					}
					
					$("#delete_btn").on('click', function() {
						var checked = jQuery('input:checkbox:checked').map(function () {
											return this.value;
									  }).get();
						jQuery('input:checkbox:checked').parents("tr").remove();
						resolve_table();
					});
					
					function resolve_table(){
						var i = 0;
						dd = [];
						$("#tablebody").find("tr").each(function() { //dohvati sve redove
							dd[i] = $(this).find('.data').html(); 
							i++;
						});
						create_table();
					}
				
					/** -/- **/