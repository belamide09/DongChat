var socket = io.connect(location.origin+':4000',{query:"user_id="+my_id+"&name="+my_name+"&video_chat="+true});
$(document).ready(function() {
	$( "#partner-webcam-container" ).resizable({
		handles: 's',
		minHeight: 200,
    maxHeight: 490,
	});
	$( "#partner-webcam-container" ).resize(function() {
		$("#partner-webcam").css('height',$(this).css('height'));
		var chatbox_height = (490 - $(this).height()) + 300;
		var conversation_height = (490 - $(this).height()) + 200;
		$("#chatbox-container").css('height',chatbox_height+'px');
		$("#conversations").css('height',conversation_height+'px');
	})
	$("#txt-message").keypress(function(e) {
		if ( e.keyCode == 13 ) {
	 		validateMessage();
		}
	});
	$("#send").click(validateMessage);

	function validateMessage() {
		var msg = $("#txt-message").val();
		$("#txt-message").val("");
		if ( msg.trim() != '' && onchat && socket.connected == true ) {
			for(var peer_id in peer.connections) {
			  for(var x in peer.connections[peer_id]) {
			    var conn = peer.connections[peer_id][x];
			    if ( conn.label == 'chat' ) {
			    	conn.send(msg);
			    }
			  }
			}
      var message = '<div class="message">You: '+msg+'</div>';
			$("#conversations .reconnecting").after(message);
		}
	}

	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));

  $(".btn-leave").click(function() {
  	socket.emit('leave_room',{room_id:room_id,user_id:my_id});
  	$(location).attr('href','/dongdong');
  	return false;
  });

  $(".btn-back").click(function() {
  	socket.emit('go_back_to_room',{user_id:my_id});
  	$(location).attr('href','ChatRoom');
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
				$("#conversations .reconnecting").after(message);
			}
		}
	})


  socket.on('refresh_rooms',function() {
  	socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
  });

  socket.on('go_back_to_room',function(data) {
  	if ( data['user_id'] == my_id ) {
  		$(location).attr('href','ChatRoom');
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
  		var message = '<div class="message" style="color:red;">Your chat partner has been disconnected... Please wait until the time finish</div>';
  		message += '<div class="message" style="color:blue;">Note: Your chat partner may also reconnect from this chat so please wait for a while</div>';
  		$("#conversations .reconnecting").after(message);
  		peer.connections = {};
  	}
  })

  socket.on('connect_server',function(data) {
  	if ( data['user_id'] == my_id ) {
			$(".reconnecting").hide();
			init();
  		console.log( 'You have just reconnect to server!' );
  	}
  })

  socket.on('reconnect_chat',function(data) {
  	if ( data['user_id'] == my_id ) {
  		$(".btn-end-chat").show();
  		$("#conversations .reconnecting").after('<div class="message">Waiting for the camera...</div>');
  		if ( data['partner'] != null ) {
	  		var peer = data['partner']['peer'];
	  		partner_id = data['partner']['id'];
	  		ReconnectToPeer(peer);
	  	} else {
	  		var message = '<div class="message" style="color:red;">Your chat partner has been disconnected... Please wait until the time finish</div>';
	  		message += '<div class="message" style="color:blue;">Note: Your chat partner may also reconnect from this chat so please wait for a while</div>';
	  		$("#conversations .reconnecting").after(message);
	  	}
  	} else if ( data['user_id'] == partner_id ) {
  		$("#conversations .reconnecting").after('<div class="message">Your Chate mate is trying to reconnect...</div>');
  	}
  })

  socket.on('notify_reconnect',function(data) {
  	if ( data['partner'] == partner_id ) {
  		var message = '<div class="message">'+data['name']+' has been reconnected from the chat</div>';
  		$("#conversations .reconnecting").after(message);
  	} else if ( data['partner'] == my_id ) {
  		var message = '<div class="message">You have reconnected from the chat</div>';
  		$("#conversations .reconnecting").after(message);
  	}
  })

  socket.on('return_remaining_time',function(data) {
  	if ( data['user_id'] == my_id ) {
	  	remaining_time = data['remaining_time'];
	  	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
	  	onchat = true;
	  	clearInterval(timer);
      timer = setInterval(function() {
        remaining_time--;
        $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
        if ( remaining_time <= 0 || !onchat ) {
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
		  $("#conversations").html('<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>');
		  $(".btn-end-chat").hide();
		  $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
		  ClosePeer();
		  $("#partner-webcam").attr('src',null);
		  clearInterval(timer);
		  partner_id = "";
		  if ( data['kill'] == 1 ) {
		  	alert('The administrator kill this chat...');
		  }
  	}
  });

  socket.on('notify_disconnect_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
  		if ( data['user_id'] == partner_id ) {
  			alert(data['name']+' has forcely end the chat');
  		}
    	remaining_time = chat_time;
		  chat_hash = "";
		  onchat = false;
		  $("#conversations").html('<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>');
		  $(".btn-end-chat").hide();
		  $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
		  ClosePeer();
		  $("#partner-webcam").attr('src',null);
		  clearInterval(timer);
		  partner_id = "";
  	}
  })

  socket.on('start_chattime',function(data) {
  	$("#conversations").html('<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>');
  	if ( data['chat_hash'] == chat_hash ) {
  		$(".reconnecting").hide();
  		$(".btn-end-chat").show();
      onchat = true;
      timer = setInterval(function() {
        remaining_time--;
        $("#remaining-time").text('Remaining time : '+convertTime(remaining_time));
        if ( remaining_time <= 0 || !onchat ) {
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
				if ( members[x]['onair_user'] != null && members[x]['onair_user']['on_video_room'] == 1 && 
						 $(".user-"+data['members'][x]['user']['id']).length == 0 ) {
					var member = members[x]['user'];
					member_container += '<li class="user-'+member['id']+'">';
					if ( members[x]['onair_user']['chat_hash'] == "" ) {
						member_container += '<span class="btn btn-primary btn-xs btn-call" onclick="Call('+member['id']+')">Call</span>';
					} else {
						member_container += '<span class="btn btn-danger btn-xs btn-call" disabled onclick="Call('+member['id']+')">On chat</span>';
					}
					member_container += '<table class="member"><tr>';
					member_container += '<td><div class="member-image"><center><img src="/dongdong/user_image/'+member['photo']+'"></center></div></td>';
					member_container += '<td><div class="member-name">'+member['name']+'</div></td>';
					member_container += '</tr></table></li>';
				}
			}
			member_container += '</ul>';
			$("#member-list").html(member_container);
		}
	});

	socket.on('append_new_room_member',function(data) {
		if ( data['room_id'] == room_id && data['member']['id'] != my_id) {
			if ( data['member']['onair_user'] != null && data['member']['onair_user']['on_video_room'] == 1 && 
					 $(".user-"+data['member']['id']).length == 0) {
				var member = data['member'];
				var member_container = "";
				member_container += '<li class="user-'+member['id']+'">';
				if ( data['member']['onair_user']['chat_hash'] == '' ) {
					member_container += '<span class="btn btn-primary btn-xs btn-call" onclick="Call('+member['id']+')">Call</span>';
				} else {
					member_container += '<span class="btn btn-danger btn-xs btn-call" disabled onclick="Call('+member['id']+')">On chat</span>';
				}
				member_container += '<table class="member"><tr>';
				member_container += '<td><div class="member-image"><center><img src="/dongdong/user_image/'+member['photo']+'"></center></div></td>';
				member_container += '<td><div class="member-name">'+member['name']+'</div></td>';
				member_container += '</tr></table></li>';
				$("#member-list ul").append(member_container);
			}
		}
	});

	socket.on('remove_room_member',function(data) {
		if ( data['user_id'] == my_id ) {
			console.log( 'test' );
			socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
		} else if ( data['user_id'] != my_id ) {
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
			$(".user-"+data[x]+' .btn-call').removeAttr('disabled');
			$(".user-"+data[x]+' .btn-call').attr('class','btn btn-primary btn-xs btn-call');
			$(".user-"+data[x]+' .btn-call').html('Call');
		}
	});

	socket.on('disconnect',function() {
		$(".reconnecting").show();
		$("#member-list").html("");
		console.log( 'you have disconnected!' );
	});

	socket.on('reconnect_server',function(data) {
		if ( data['user_id'] == my_id ) {
			init();
			console.log( 'reconnect!' );
		}
	})

})