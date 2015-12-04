var socket = io.connect('http://192.168.0.187:3000',{query:"user_id="+my_id});
$(document).ready(function() {
	
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
			socket.emit('send_room_message',data);
		}
	})	

  $(".btn-leave").click(function() {
  	socket.emit('leave_room',{room_id:room_id,user_id:my_id});
  });

  $(".btn-video-chat").click(function() {
  	socket.emit('video_chat_room',{user_id:my_id});
  	return false;
  })

  socket.on('redirect_to_chat',function(data) {
  	if ( data['user_id'] == my_id ) {
  		$(location).attr('href','/VideoCall')
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

	socket.on('return_chatroom_members',function(data) {
		if ( data['user_id'] == my_id ) {
			var members = data['members'];
			var member_container = '<ul>';
			for( var x in members) {
				if ( members[x]['onair_user'] != null ) {
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
				peer._cleanup();
				remaining_time = chat_time;
				$("#partner-webcam").attr('src',null);
				if ( data['ended'] ) {
					alert('Your chat is now time\'s up!');
				} else {
					alert('( You/Your chat partner ) has been disconnected');
				}
			}
		}

	});

})