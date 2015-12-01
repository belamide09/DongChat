var socket = io.connect('http://192.168.0.187:3000',{query:"user_id="+my_id});
$(document).ready(function() {
	var ready 		= false;
	$("#message-form").submit(function(e) {
		e.preventDefault();
		var message = $("#txt-message").val();
		eachActiveConnection(function(c, $c) {
      if (c.label === 'chat') {
				c.send(message);
      	console.log ( message );
      }
    });
	})
	$(".btn-ready").click(function() {
		if ( ready == false ) {
			socket.emit('ready',{user_id:my_id,room_id:room_id});
		}
		return false;
	})

	$(".btn-start").click(function() {
		StartGroupChat();
		return false;
	})

	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));

  $(".btn-leave").click(function() {
  	socket.emit('leave_room',{room_id:room_id,user_id:my_id});
  	return false;
  });

  socket.on('refresh_rooms',function() {
  	socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
  });

  socket.on('change_status_to_ready',function(data) {
  	if ( data['user_id'] == my_id ) { 
  		ready = true;
  		$(".btn-ready").attr('disabled','disabled');
  		$(".btn-ready").html('Now ready');
  	} else if ( data['room_id'] == room_id && typeof group_members[data['user_id']] != 'undefined' ) {
  		group_members[data['user_id']]['ready'] = 1;
  		$(".user-"+data['user_id']).prepend('<input type="button" value="Ready" class="btn btn-success btn-xs status-ready">');
  		EnabledStartButton();
  	}
  });

  socket.on('start_chat',function(data) {
  	if ( data['room_id'] == room_id ) {
  		StartGroupChat();
  	}
  })

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
  	EnabledStartButton();
  });

	socket.on('return_chatroom_members',function(data) {
		if ( data['user_id'] == my_id ) {
			$("#group-webcam-container").html("");
			var members = data['members'];
			var member_container = '<ul>';
			for( var x in members) {
				if ( members[x]['onair_user'] ) {
					var member 	= members[x]['user'];
					var onair 	= members[x]['onair_user'];
					member_container += '<li class="user-'+member['id']+'">';
					member_container += '<table class="member"><tr>';
					if ( members[x]['ready'] == 1 ) {
						member_container += '<input type="button" value="Ready" class="btn btn-success btn-xs status-ready">';
					}
					member_container += '<td><div class="member-image"><center><img src="/user_image/'+member['photo']+'"></center></div></td>';
					member_container += '<td><div class="member-name">'+member['firstname']+' '+member['lastname']+'</div></td>';
					member_container += '</tr></table></li>';
					group_members[member['id']] 				= {};
					group_members[member['id']]['peer'] = onair['peer'];
					group_members[member['id']]['name'] = member['firstname']+' '+member['lastname'];
					group_members[member['id']]['ready'] = members[x]['ready'];


  				$("#group-webcam-container").append('<video class="video-'+onair['peer']+' video" autoplay></video>');
				}
			}
			member_container += '</ul>';
			$("#member-list").html(member_container);
		}
	});

	socket.on('remove_room_member',function(data) {
		if ( data['user_id'] == my_id ) {
			location.reload();
		} else {
			if ( typeof group_members[data['user_id']] !== 'undefined' ) {
				$('.video-'+group_members[data['user_id']]['peer']).remove();
			}
			delete group_members[data['user_id']];
			$(".user-"+data['user_id']).remove();
		}
	});

	function EnabledStartButton() {
		$(".btn-start").removeAttr('disabled','disabled');
		for(var x in group_members) {
			if ( group_members[x]['ready'] == 0 ) {
				$(".btn-start").attr('disabled');
			}
		}
	}

})