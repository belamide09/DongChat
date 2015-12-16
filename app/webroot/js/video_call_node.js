var socket = io.connect(location.origin+':4000',{query:"user_id="+my_id+"&room_id="+room_id+"&name="+my_name+"&partner_type="+partner_type});
$(document).ready(function() {
	var webcam_height_orig = parseInt($("#partner-webcam-container").css('height'));
	var chatbox_height_orig = parseInt($("#chatbox-container").css('height'));
	var conversations_height_orig = parseInt($("#conversations").css('height'));
	$( "#partner-webcam-container" ).resizable({
		handles: 's',
		minHeight: 200,
    maxHeight: 550
	});
	$( "#partner-webcam-container" ).resize(function() {
		$("#partner-webcam").css('height',$(this).css('height'));
		var diff = parseInt($(this).css('height')) - webcam_height_orig;
		var chatbox_height =  chatbox_height_orig - diff;
		var conversation_height = conversations_height_orig - diff;
		$("#chatbox-container").css('height',chatbox_height+'px');
		$("#conversations").css('height',conversation_height+'px');
	})
  $(".btn-disable-video").click(function() {
    disabled_video = parseInt($(this).attr('disable-video')) ? 0 : 1;
    $(this).attr('disable-video',disabled_video);
    socket.emit('toggle_video_disabled',{user_id:my_id,disabled:disabled_video});
    if ( disabled_video ) {
      $(this).attr('class','btn btn-default btn-xs btn-disable-video off');
      $(".btn-disable-video i").attr('class','fa fa-eye-slash');
    } else {
      $(this).attr('class','btn btn-default btn-xs btn-disable-video onn');
      $(".btn-disable-video i").attr('class','fa fa-eye');
    }
    $.post('VideoCall/disableVideo',{disabled:disabled_video});
  })
  $(".btn-resolution-control").click(function() {
    if ( $("#resolution-list").css('display') == 'none' ) 
      $("#resolution-list").show();
    else 
      $("#resolution-list").hide();
  })
  $("#resolution-list li").click(function() {
    $('#resolution-list li').removeAttr('style');
    $("#resolution-list li").removeClass('selected');
    $(this).addClass('selected');
    $("#resolution-list").hide();
    var size = $(this).attr('data-value');
    video_constraints['mandatory']['maxHeight'] = size;
    video_constraints['mandatory']['minHeight'] = size;
    video_constraints['mandatory']['maxWidth'] = size;
    video_constraints['mandatory']['minWidth'] = size;
    setVideoSettings();
    if ( onchat ) {
      socket.emit('change_partner_resolution',{partner_id:partner_id,peer:peer.id});
    }
  })
  $(".btn").tooltip();
	$(".btn-start-chat").click(function() {
		Call();
	})
	$("#txt-message").keypress(function(e) {
		if ( e.keyCode == 13 ) SendMessage();
	});
	$("#send").click(SendMessage);

  function SendMessage() {
    var msg = $("#txt-message").val();
    $("#txt-message").val("");
    $("#txt-message")[0].focus();
    if ( msg.trim() != '' && onchat && socket.connected == true ) {
      socket.emit('send_message',{user_id:my_id,name:my_name,chat_hash:chat_hash,message:msg});
    }
  }

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

  socket.on('receive_message',function(data) {
    if ( data['chat_hash'] == chat_hash ) {
      var message = '<div class="message">'+data['name']+' : '+data['message']+'</div>';
      $("#conversations .reconnecting").after(message);
    }
  })

  socket.on('toggle_video_disabled',function(data) {
    if ( data['user_id'] == partner_id ) {
      partner_video_disabled = data['disabled'];
    }
    if ( data['user_id'] == partner_id && onchat) {
      if ( partner_video_disabled ) {
        $("#partner-webcam").removeAttr('src');
      } else {
        $('#partner-webcam').prop('src', URL.createObjectURL(partner_stream));
      }
    }
  })

  socket.on('change_partner_resolution',function(data) {
    if ( data['partner_id'] == my_id ) {
      peer.call(data['peer'], window.localStream);
    }
  })

  socket.on('remove_room_mate',function(data) {
  	if ( data['partner'] == partner_id ) {
      $(".btn-start-chat").attr('disabled','disabled');
      $(".btn-start-chat").addClass('disable');
  	}
  });

  socket.on('append_new_member',function(data) {
  	if ( data['room_id'] == room_id && data['user_id'] != my_id ) {
  		var message = '<div class="message">Server: <span style="color:blue;">'+data['name']+' has joined your room</span></div>';
  		$("#conversations .reconnecting").after(message);
  		partner_id    = data['user_id'];
      partner_name  = data['name'];
      $(".btn-start-chat").removeAttr('disabled');
      $(".btn-start-chat").removeClass('disable');
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
      $(".btn-start-chat").addClass('disable');
  	}
  });

  socket.on('notify_disconnect_chat_partner',function(data) {
    if ( data['chat_hash'] == chat_hash && data['user_id'] == partner_id) {
  		var message = '<div class="message">Server: <span style="color:blue;">'+partner_name+' may also reconnect from this chat so please wait for a while</span></div>';
  		message += '<div class="message">Server: <span style="color:red;">'+partner_name+' has been disconnected... Please wait until the time finish</span></div>';
  		$("#conversations .reconnecting").after(message);
  		peer.connections = {};
  	}
  })

  socket.on('connect_server',function(data) {
    if ( chat_hash != "" && data['chat_hash'] == chat_hash ) {
      $(".btn-start-chat").attr('disabled','disabled');
      $(".btn-start-chat").addClass('disable');
    }

    if ( data['user_id'] == my_id || data['user_id'] == partner_id ) {
      socket.emit('toggle_video_disabled',{user_id:my_id,disabled:disabled_video});
    }
  	if ( data['user_id'] == my_id && data['chat_hash'] != '' ) {
      chat_hash = data['chat_hash'];
      $("#conversations .reconnecting").after('<div class="message">Server: Reconnecting to the chat</div>');
			$(".reconnecting").hide();
      init();
  	} else if ( data['user_id'] == partner_id && data['chat_hash'] != '' ) {
      chat_hash = data['chat_hash'];
      $("#conversations .reconnecting").after('<div class="message">Server: '+partner_name+' is trying to reconnect the chat</div>');
    } else if ( data['user_id'] == my_id ) {
      setVideoSettings();
      $(".reconnecting").hide();
      init();
    } else if ( data['user_id'] == partner_id ) {
      $(".btn-start-chat").removeAttr('disabled');
      $(".btn-start-chat").removeClass('disable');
    }
  })

  socket.on('reconnect_chat_partner',function(data) {
    if ( data['user_id'] == partner_id ) {
      console.log( 'reconnect!' );
      $("#conversations .reconnecting").after('<div class="message">Server: '+partner_name+' is now connected to the chat</div>');
      if ( data['partner'] == null ) {
        var message = '<div class="message">Server: <span style="color:blue;">'+partner_name+' may also reconnect from this chat so please wait for a while</span></div>';
        message += '<div class="message">Server: <span style="color:red;">'+partner_name+' has been disconnected... Please wait until the time finish</span></div>';
        $("#conversations .reconnecting").after(message);
      }
      onchat = true;
  		$(".btn-end-chat").show();
			var peer = data['peer'];
  		ReconnectToPeer(peer);
		} else if ( data['user_id'] == my_id ) {
      $("#conversations .reconnecting").after('<div class="message">Server: You are now reconnected to the chat...</div>');
  	}
  })

  socket.on('end_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
		  remaining_time = chat_time;
		  chat_hash = "";
		  onchat = false;
		  $("#conversations").html('<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>');
		  $(".btn-end-chat").hide();
		  $("#remaining-time").text('--:--');
      $(".btn-start-chat").removeAttr('disabled');
      $(".btn-start-chat").removeClass('disable');
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
      $(".btn-start-chat").removeClass('disable');
    }
  });

  socket.on('notify_disconnect_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
      $(".btn-start-chat").removeAttr('disabled');
      $(".btn-start-chat").removeClass('disable');
  		if ( data['user_id'] == partner_id ) {
  			alert(data['name']+' has forcely end the chat');
  		}
    	remaining_time = chat_time;
		  chat_hash = "";
		  onchat = false;
		  $("#conversations").html('<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>');
		  $(".btn-end-chat").hide();
		  $("#remaining-time").text(convertTime(remaining_time));
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

	socket.on('enable_start_chat',function(data) {
		for(var x in data) {
      $(".btn-start-chat").removeAttr('disabled');
		}
	});

	socket.on('disconnect',function() {
		$(".reconnecting").show();
		$("#member-list").html("");
		console.log( 'you have disconnected!' );
	});

})