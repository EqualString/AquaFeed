					/**Komunikacija sa serverom**/	
					var socket = io.connect();
					var user =[], new_user =[];
					
					socket.on('us',function(data){
						user = data;
						$("#top-username").append('<span class="fa fa-user"></span> '+user[0]+'<span class="caret"></span>');
					    add_info(user);
					});
					
					/** -/- **/
					
					/** Dodavanje informacija **/
					function add_info(info) {
						$("#user_name").val(info[0]);
						$("#user_pass").val(info[1]);
					}
					
					function save_info(){
						new_user[0] = document.getElementById('user_name').value;
						new_user[1] = document.getElementById('user_pass').value;
						socket.emit('change_user', new_user);
						$("#top-username").html("");
						$("#top-username").append('<span class="fa fa-user"></span> '+new_user[0]+'<span class="caret"></span>');
						$('#modal-succes').modal('show');
					}