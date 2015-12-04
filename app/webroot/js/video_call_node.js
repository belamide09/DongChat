var socket = io.connect('http://192.168.0.187:3000',{query:"user_id="+my_id+"&name="+my_name});
$(document).ready(function() {
	$("#message-form").submit(function(e) {
		e.preventDefault();
		var msg = $("#txt-message").val();
		$("#txt-message").val("");
		if ( msg.trim() != '' ) {
			var data = {};
			data['name'] 		= my_name;
			data['room_id'] = room_id;
			data['message'] = msg;
			socket.emit('send_room_message',data)
		}
	});

	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));

  $(".btn-leave").click(function() {
  	socket.emit('leave_room',{room_id:room_id,user_id:my_id});
  });

  $(".btn-back").click(function() {
  	socket.emit('go_back_to_room',{user_id:my_id});
  	return false;
  })

  $(".btn-end-chat").click(function() {
  	var confirmation = confirm('Are you sure you want to end this chat?');
  	if ( confirmation == true ) {
	  	socket.emit('disconnect_chat',{user_id:my_id});
	  }
  })

  socket.on('return_room_messages',function(data) {
		if ( data['user_id'] == my_id ) {
			var messages = data['messages'];
			for(var x in messages) {
				var message = messages[x]['name']+' - '+messages[x]['message'];
				var message = '<div class="message">'+message+'</div>';
				$("#conversations").prepend(message);
			}
		}
	})


  socket.on('refresh_rooms',function() {
  	socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
  });

  socket.on('go_back_to_room',function(data) {
  	if ( data['user_id'] == my_id ) {
  		$(location).attr('href','/ChatRoom/'+room_id);
  	}
  })

  socket.on('request_call',function(data) {
  	if ( data['user_id'] == my_id ) {
	  	var confirmation = confirm(data['name']+' want\'s to video chat with you');
	  	if ( confirmation == true ) {
	  		socket.emit('generate_chat_hash',{recipient_id:my_id,sender_id:data['sender_id']});
	  	}
	  }
  });

  socket.on('append_chathash',function(data) {
  	if ( data['sender_id'] == my_id || data['recipient_id'] == my_id ) {
  		chat_hash = data['chat_hash'];
  	}
  });

  socket.on('notify_disconnect_chat_partner',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
  		var message = '<div class="message">Your chat partner has been disconnected... Please wait until the time finish</div>';
  		message += '<div class="message">Note: Your chat partner may also reconnect from this chat so please wait for a while</div>';
  		$("#conversations").append(message);
  	}
  })

  socket.on('reconnect_chat',function(data) {
  	if ( data['user_id'] == my_id ) {
  		var peer = data['partner']['peer'];
  		partner_id = data['partner']['id'];
  		$(".btn-end-chat").show();
  		ReconnectToPeer(peer);
  	}
  })

  socket.on('notify_reconnect',function(data) {
  	if ( data['partner'] == partner_id ) {
  		var message = '<div class="message">'+data['name']+' has been reconnected from the chat</div>';
  		$("#conversations").append(message);
  	} else if ( data['partner'] == my_id ) {
  		var message = '<div class="message">You have reconnected from the chat</div>';
  		$("#conversations").append(message);
  	}
  })

  socket.on('return_remaining_time',function(data) {
  	if ( data['user_id'] == my_id ) {
	  	remaining_time = data['remaining_time'];
	  	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
	  	onchat = true;
      timer = setInterval(function() {
        remaining_time--;
        $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
        if ( remaining_time < 0 || !onchat ) {
        	remaining_time = chat_time;
        	onchat = false;
        	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
        	endChat();
          clearInterval(timer);
        }
      },1000);
	  }
  })

  socket.on('end_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
		  remaining_time = chat_time;
		  chat_hash = "";
		  onchat = false;
		  $("#conversations").html("");
		  $(".btn-end-chat").hide();
		  $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
		  clearInterval(timer);
  	}
  });

  socket.on('notify_disconnect_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
  		if ( data['user_id'] != my_id ) {
  			alert(data['name']+' has forcely end the chat');
  		}
  		chat_hash = "";
			$(".btn-end-chat").hide();
  		remaining_time = chat_time;
    	onchat = false;
    	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
    	clearInterval(timer);
  	}
  })

  socket.on('start_chattime',function(data) {
  	$("#conversations").html("");
  	if ( data['chat_hash'] == chat_hash ) {
  		$(".btn-end-chat").show();
      onchat = true;
      timer = setInterval(function() {
        remaining_time--;
        $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
        if ( remaining_time < 0 || !onchat ) {
        	remaining_time = chat_time;
        	onchat = false;
        	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
          clearInterval(timer);
        }
      },1000);
  	}
  });

	socket.on('return_chatroom_members',function(data) {
		if ( data['user_id'] == my_id ) {
			var members = data['members'];
			var member_container = '<ul>';
			for( var x in members) {
				if ( members[x]['onair_user'] != null && members[x]['onair_user']['on_video_room'] == 1 ) {
					var member = members[x]['user'];
					member_container += '<li class="user-'+member['id']+'">';
					if ( members[x]['onair_user']['chat_hash'] == "" ) {
						member_container += '<span class="btn btn-primary btn-xs btn-call" onclick="Call('+member['id']+')">Call</span>';
					} else {
						member_container += '<span class="btn btn-danger btn-xs btn-call" disabled onclick="Call('+member['id']+')">On chat</span>';
					}
					member_container += '<table class="member"><tr>';
					member_container += '<td><div class="member-image"><center><img src="/user_image/'+member['photo']+'"></center></div></td>';
					member_container += '<td><div class="member-name">'+member['firstname']+' '+member['lastname']+'</div></td>';
					member_container += '</tr></table></li>';
				}
			}
			member_container += '</ul>';
			$("#member-list").html(member_container);
		}
	});

	socket.on('append_new_room_member',function(data) {
		if ( data['room_id'] == room_id && data['member']['id'] != my_id) {
			if ( data['member']['onair_user'] != null && data['member']['onair_user']['on_video_room'] == 1 ) {
				var member = data['member'];
				var member_container = "";
				member_container += '<li class="user-'+member['id']+'">';
				if ( data['member']['onair_user']['chat_hash'] == '' ) {
					member_container += '<span class="btn btn-primary btn-xs btn-call" onclick="Call('+member['id']+')">Call</span>';
				} else {
					member_container += '<span class="btn btn-danger btn-xs btn-call" disabled onclick="Call('+member['id']+')">On chat</span>';
				}
				member_container += '<table class="member"><tr>';
				member_container += '<td><div class="member-image"><center><img src="/user_image/'+member['photo']+'"></center></div></td>';
				member_container += '<td><div class="member-name">'+member['firstname']+' '+member['lastname']+'</div></td>';
				member_container += '</tr></table></li>';
				$("#member-list ul").append(member_container);
			}
		}
	});

	socket.on('remove_room_member',function(data) {
		if ( data['user_id'] == my_id ) {
			location.reload();
		} else {
			$(".user-"+data['user_id']).remove();
		}
	});

	socket.on('disable_chat_user',function(data) {

		$(".user-"+data['sender_id']+' .btn-call').attr('disabled','disabled');
		$(".user-"+data['sender_id']+' .btn-call').attr('class','btn btn-danger btn-xs btn-call');
		$(".user-"+data['sender_id']+' .btn-call').html('On chat');

		$(".user-"+data['recipient_id']+' .btn-call').attr('disabled','disabled');
		$(".user-"+data['recipient_id']+' .btn-call').attr('class','btn btn-danger btn-xs btn-call');
		$(".user-"+data['recipient_id']+' .btn-call').html('On chat');

	})

	socket.on('update_users_status',function(data) {

		for(var x in data) {
			$(".user-"+data[x]['id']+' .btn-call').removeAttr('disabled');
			$(".user-"+data[x]['id']+' .btn-call').attr('class','btn btn-primary btn-xs btn-call');
			$(".user-"+data[x]['id']+' .btn-call').html('Call');
		}

	});

	socket.on('set_users_available',function(data) {

		if ( data ) {
			$(".user-"+data['id']+' .btn-call').removeAttr('disabled');
			$(".user-"+data['id']+' .btn-call').attr('class','btn btn-primary btn-xs btn-call');
			$(".user-"+data['id']+' .btn-call').html('Call');
		}

	})

	socket.on('notify_end_chat',function(data) {
		var users = data['users'];
		for(var x in users) {
			if ( users[x]['id'] == my_id ) {
				$(".btn-end-chat").hide();
				remaining_time = chat_time;
				$("#partner-webcam").attr('src',null);
				if ( data['ended'] ) {
					alert('Your chat is now time\'s up!');
				} else {
					alert('( You/Your chat partner ) has been disconnected from the server');
				}
			}
		}

	});

})