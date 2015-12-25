					/**Komunikacija sa serverom**/	
					var socket = io.connect();
					var new_user =[];
					
					socket.on('user_credentials',function(data){
						add_info(data);
					});
					
					/** -/- **/
					function add_info(data){
						$("#top-username").append('<span class="fa fa-user"></span> '+data[0]+'<span class="caret"></span>');
						$('#user_name').val(data[0]);
						$('#user_pass').val(data[1]);
					}
					
					function save_info(){
						new_user[0] = document.getElementById('user_name').value;
						new_user[1] = document.getElementById('user_pass').value;
						socket.emit('change_user', new_user);
						$("#top-username").html("");
						$("#top-username").append('<span class="fa fa-user"></span> '+new_user[0]+'<span class="caret"></span>');
						$('#modal-succes').modal('show');
					}