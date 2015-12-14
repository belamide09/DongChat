var socket = io.connect(location.origin+':4000',{query:"user_id="+my_id+"&room_id="+room_id+"&name="+my_name+"&partner_type="+partner_type});
$(document).ready(function() {
	var webcam_height_orig = parseInt($("#partner-webcam-container").css('height'));
	var chatbox_height_orig = parseInt($("#chatbox-container").css('height'));
	var conversations_height_orig = parseInt($("#conversations").css('height'));
	$( "#partner-webcam-container" ).resizable({
		handles: 's',
		minHeight: 200,
    maxHeight: 400
	});
	$( "#partner-webcam-container" ).resize(function() {
		$("#partner-webcam").css('height',$(this).css('height'));
		var diff = parseInt($(this).css('height')) - webcam_height_orig;
		var chatbox_height =  chatbox_height_orig - diff;
		var conversation_height = conversations_height_orig - diff;
		$("#chatbox-container").css('height',chatbox_height+'px');
		$("#conversations").css('height',conversation_height+'px');
	})
	$(".btn-start-chat").click(function() {
		Call();
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
      var message = '<div class="message">'+my_name+': '+msg+'</div>';
			$("#conversations .reconnecting").after(message);
		}
	}

	$("#remaining-time").text('Remaining time : '+convertTime(remaining_time));

  $(".btn-leave").click(function() {
  	if ( onchat ) {
	  	var confirmation = confirm('You are still chatting with someone. You can only leave after chatting.\nAre you sure you want to leave this room?');
	  	if ( confirmation ) {
		  	socket.emit('leave_room',{user_id:my_id});
		  	socket.emit('disconnect_chat',{user_id:my_id});
		  	$(location).attr('href','/dongdong');
		  }
	  } else {
      socket.emit('leave_room',{user_id:my_id});
      socket.emit('disconnect_chat',{user_id:my_id});
      $(location).attr('href','/dongdong');
    }
  	return false;
  });

  $(".btn-back").click(function() {
  	$(location).attr('href','/dongdong');
  	return false;
  })

  $(".btn-end-chat").click(function() {
  	var confirmation = confirm('Are you sure you want to end this chat?');
  	if ( confirmation == true ) {
	  	socket.emit('disconnect_chat',{user_id:my_id});
	  }
  })

  socket.on('remove_room_mate',function(data) {
  	if ( data['partner'] == partner_id ) {
      $(".btn-start-chat").attr('disabled','disabled');
  	}
  });

  socket.on('append_new_member',function(data) {
  	if ( data['room_id'] == room_id && data['user_id'] != my_id ) {
  		var message = '<div class="message" style="color:blue;">'+data['name']+' has joined your room</div>';
  		$("#conversations .reconnecting").after(message);
  		partner_id    = data['user_id'];
      partner_name  = data['name'];
      $(".btn-start-chat").removeAttr('disabled');
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
      $(".btn-start-chat").attr('disabled','disabled');
  	}
  });

  socket.on('notify_disconnect_chat_partner',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
  		var message = '<div class="message" style="color:blue;">Note:'+data['name']+' may also reconnect from this chat so please wait for a while</div>';
  		message += '<div class="message" style="color:red;">'+data['name']+' has been disconnected... Please wait until the time finish</div>';
  		$("#conversations .reconnecting").after(message);
  		peer.connections = {};
  	}
  })

  socket.on('connect_server',function(data) {
  	if ( data['user_id'] == my_id && data['chat_hash'] != '' ) {
      chat_hash = data['chat_hash'];
      $("#conversations .reconnecting").after('<div class="message"> Reconnecting to the chat</div>');
			$(".reconnecting").hide();
      if ( data['partner'] == null ) {
        var message = '<div class="message" style="color:blue;">Note:'+partner_name+' may also reconnect from this chat so please wait for a while</div>';
        message += '<div class="message" style="color:red;">'+partner_name+' has been disconnected... Please wait until the time finish</div>';
        $("#conversations .reconnecting").after(message);
      }
      init();
  	} else if ( data['user_id'] == partner_id && data['chat_hash'] != '' ) {
      chat_hash = data['chat_hash'];
      $("#conversations .reconnecting").after('<div class="message">'+partner_name+' is trying to reconnect the chat</div>');
    } else if ( data['user_id'] == my_id ) {
      $(".reconnecting").hide();
      init();
    } else if ( data['user_id'] == partner_id ) {
      $(".btn-start-chat").removeAttr('disabled');
    }
  })

  socket.on('reconnect_chat_partner',function(data) {
    if ( data['user_id'] == partner_id ) {
      console.log( 'reconnect!' );
      $("#conversations .reconnecting").after('<div class="message">'+partner_name+' is now connected to the chat</div>');
      onchat = true;
  		$(".btn-end-chat").show();
			var peer = data['peer'];
  		ReconnectToPeer(peer);
		} else if ( data['user_id'] == my_id ) {
      $("#conversations .reconnecting").after('<div class="message"> You are now reconnected to the chat...</div>');
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
      $(".btn-start-chat").removeAttr('disabled');
		  $("#partner-webcam").attr('src',null);
		  clearInterval(timer);
		  if ( data['kill'] == 1 ) {
		  	alert('The administrator kill this chat...');
		  }
  	}
  });

  socket.on('enable_start_btn',function(data) {
    if ( data['sender_id'] == my_id || data['recipient_id'] == my_id ) {
      $(".btn-start-chat").removeAttr('disabled');
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
  	}
  })

  socket.on('start_chattime',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
      if ( typeof data['remaining_time'] != 'undefined' ) {
        remaining_time = data['remaining_time'];
      }
  		StartTime();
  	}
  });

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

})