var socket = io.connect('http://192.168.0.187:3000',{query:"user_id="+my_id});
$(document).ready(function() {
	
	$("#message-form").click(function(e) {
		e.preventDefault();
		var message = $("#txt-message").val();
		c.send(message);
	})	

	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));

  $(".btn-leave").click(function() {
  	socket.emit('leave_room',{room_id:room_id,user_id:my_id});
  });

  socket.on('refresh_rooms',function() {
  	socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
  });

  socket.on('append_chathash',function(data) {
  	if ( data['sender_id'] == my_id || data['recipient_id'] == my_id ) {
  		chat_hash = data['chat_hash'];
  	}
  });

  socket.on('end_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
  		peer._cleanup();
		  remaining_time = chat_time;
		  onchat = false;
		  $("#remaining_time").text('Remaining time : '+convertTime(remaining_time));
  	}
  });

  socket.on('start_chattime',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
      onchat = true;
      var timer = setInterval(function() {
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

			for( var x in members) {
				if ( members[x]['onair_user'] ) {
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
		if ( data['room_id'] == room_id ) {
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

	socket.on('update_users_status',function(data) {
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