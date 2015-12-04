var socket = io.connect('http://192.168.0.187:3000',{query:"user_id="+my_id});
$(document).ready(function() {	
	var chat_hash = "";
	socket.emit('get_room_messages',{user_id:my_id,room_id:room_id});

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

  socket.on('append_room_message',function(data) {

  	if ( data['room_id'] == room_id ) {
  		var message = data['name']+' - '+data['message'];
			var message = '<div class="message">'+message+'</div>';
			$("#conversations").prepend(message);
  	}

  })

  socket.on('refresh_rooms',function() {
  	socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
  });

  socket.on('request_call',function(data) {

  	if ( data['user_id'] == my_id ) {
	  	var confirmation = confirm(data['name']+' want\'s to video chat with you');
	  	if ( confirmation == true ) {
	  		socket.emit('generate_chat_hash',{recipient_id:my_id,sender_id:data['sender_id']});
	  	}
	  }

  });

  socket.on('redirect_to_chat',function(data) {

  	window.open('/VideoCall/'+data['chat_hash']);

  })

  socket.on('append_chathash',function(data) {
  	if ( data['sender_id'] == my_id || data['recipient_id'] == my_id ) {
  		chat_hash = data['chat_hash'];
  	}
  });

  socket.on('end_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
		  remaining_time = chat_time;
		  chat_hash = "";
		  onchat = false;
		  $(".btn-end-chat").hide();
		  $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
		  clearInterval(timer);
  	}
  });

  socket.on('notify_disconnect_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
  		if ( data['user_id'] != my_id ) {
  			alert(room_members[data['user_id']]['name']+' has disconnected the chat');
  		}
			$(".btn-end-chat").hide();
  		chat_hash = "";
  		remaining_time = chat_time;
    	onchat = false;
    	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
    	clearInterval(timer);
  	}
  })

  socket.on('start_chattime',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
  		$(".btn-end-chat").show();
      onchat = true;
      timer = setInterval(function() {
        remaining_time--;
        $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
        if ( remaining_time == 0 || !onchat ) {
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
			room_members = {};
			for( var x in members) {
				if ( members[x]['onair_user'] != null ) {
					var member = members[x]['user'];
					member_container += '<li class="user-'+member['id']+'">';
					member_container += '<table class="member"><tr>';
					member_container += '<td><div class="member-image"><center><img src="/user_image/'+member['photo']+'"></center></div></td>';
					member_container += '<td><div class="member-name">'+member['firstname']+' '+member['lastname']+'</div></td>';
					member_container += '</tr></table></li>';
					room_members[member['id']] = {};
					room_members[member['id']]['peer'] = members[x]['onair_user']['peer'];
					room_members[member['id']]['name'] = member['firstname']+' '+member['lastname'];
				}
			}
			member_container += '</ul>';
			$("#member-list").html(member_container);
		}
	});

	socket.on('append_new_room_member',function(data) {
		if ( data['room_id'] == room_id && data['member']['id'] != my_id) {
			if ( data['member']['onair_user'] != null ) {
				var member = data['member'];
				var member_container = "";
				member_container += '<li class="user-'+member['id']+'">';
				member_container += '<span class="btn btn-primary btn-xs btn-call" onclick="Call('+member['id']+')">Call</span>';
				member_container += '<table class="member"><tr>';
				member_container += '<td><div class="member-image"><center><img src="/user_image/'+member['photo']+'"></center></div></td>';
				member_container += '<td><div class="member-name">'+member['firstname']+' '+member['lastname']+'</div></td>';
				member_container += '</tr></table></li>';
				$("#member-list ul").append(member_container);
				room_members[member['id']] = {};
				room_members[member['id']]['peer'] = data['member']['onair_user']['peer'];
				room_members[member['id']]['name'] = member['firstname']+' '+member['lastname'];
			}
		}
	});

	socket.on('remove_room_member',function(data) {
		if ( data['user_id'] == my_id ) {
			location.reload();
		} else {
			$(".user-"+data['user_id']).remove();
			delete room_members[data['user_id']];
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