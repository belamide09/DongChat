var socket = io.connect(location.origin+':4000',{query:"user_id="+my_id+"&room_id="+room_id+"&name="+my_name+"&partner_type="+partner_type});
$(document).ready(function() {
  var remaining_time;
  var timer;
	var webcam_height_orig = parseInt($("#partner-webcam-container").css('height'));
	var chatbox_height_orig = parseInt($("#chatbox-container").css('height'));
	var conversations_height_orig = parseInt($("#conversations").css('height'));

  // Resizable video
	$( "#partner-webcam-container" ).resizable({
		handles: 's',
		minHeight: 200,
    maxHeight: 550
	});


  // Adjust video size and chatbox when partner webcam container resize
	$( "#partner-webcam-container" ).resize(function() {
		$("#partner-webcam").css('height',$(this).css('height'));
		var diff = parseInt($(this).css('height')) - webcam_height_orig;
		var chatbox_height =  chatbox_height_orig - diff;
		var conversation_height = conversations_height_orig - diff;
		$("#chatbox-container").css('height',chatbox_height+'px');
		$("#conversations").css('height',conversation_height+'px');
	})

  // Disable/Enable video to your chat partner
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

  // Show resolution control
  $(".btn-resolution").click(function() {
    if ( $("#resolution-list").css('display') == 'none' ) 
      $("#resolution-list").show();
    else 
      $("#resolution-list").hide();
  })

  // Show resolution control
  $(".btn-bitrate").click(function() {
    if ( $("#bit-rate-range").css('display') == 'none' ) 
      $("#bit-rate-range").show();
    else 
      $("#bit-rate-range").hide();
  })

  $(document).click(function(evt) {
    if ( !evt.target.className.match('btn-resolution')) {
      $("#resolution-list").hide();
    }
    if ( !evt.target.className.match('btn-bitrate') ) {
      $("#bit-rate-range").hide();
    }
  });

  // Select resolution
  $("#resolution-list li").click(function() {
    var class_name = $(this).attr('class');
    var selected = typeof class_name != 'undefined' && class_name == 'selected' ? true : false;
    $("#resolution-list").hide();
    if ( !selected ) {
      $('#resolution-list li').removeAttr('style');
      $("#resolution-list li").removeClass('selected');
      $(this).addClass('selected');
      resolution = $(this).attr('data-value');
      var data = {
        partner_id: partner_id,
        peer: peer.id,
        resolution: resolution,
        bit_rate: bit_rate
      }
      socket.emit('change_video_quality',data);
    }
  })

  // Change bit rate
  $( "#bit-rate-range" ).slider({
    orientation: "vertical",
    range: "min",
    min: 1,
    max: 30,
    value: 30,
    slide: function( event, ui ) {
      bit_rate = ui.value;
    }
  });

  $( "#bit-rate-range" ).mouseup(setBitRate);
  $( "#bit-rate-range" ).click(setBitRate);

  // Change partner video bit rate
  function setBitRate() {
    $("#bit-rate-range").hide();
    var data = {
      partner_id: partner_id,
      peer: peer.id,
      resolution: resolution,
      bit_rate: bit_rate
    }
    socket.emit('change_video_quality',data);
  }

  $(".btn").tooltip();

  // Start chat
	$(".btn-start-chat").click(function() {
    socket.emit('save_chat',{sender_id:my_id,recipient_id:partner_id});
    $(".btn-start-chat").attr('disabled','disabled');
    $(".btn-start-chat").addClass('disable');
		Call();
	})

	$("#txt-message").keypress(function(e) {
		if ( e.keyCode == 13 ) SendMessage();
	});

	$("#send").click(SendMessage);

  // Send chat message
  function SendMessage() {
    var msg = $("#txt-message").val();
    $("#txt-message").val("");
    $("#txt-message")[0].focus();
    if ( msg.trim() && onchat && socket.connected && jQuery.isEmptyObject(peer.connections) ) {
      alert('Your chat partner is not yet reconnected from the chat!');
    } else if ( msg.trim() != '' && onchat && socket.connected ) {
      var last_index = peer.connections[partner_peer].length - 1;
      peer.connections[partner_peer][last_index].send(msg);
      var message = '<div class="message">'+my_name+' : '+msg+'</div>';
      $("#conversations .reconnecting").after(message);
    }
  }

  // Leave room
  $(".btn-leave").click(function() {
  	if ( onchat ) {
	  	var confirmation = confirm('You are still chatting with someone. You can only leave after chatting.\nAre you sure you want to leave this room?');
	  	if ( confirmation == true ) {
        onchat = false;
		  	socket.emit('leave_room',{user_id:my_id});
		  	socket.emit('disconnect_chat',{chat_hash:chat_hash});
		  	$(location).attr('href','../');
		  }
	  } else {
      var confirmation = confirm('Are you sure you want to leave this room?');
      if ( confirmation == true ) {
        socket.emit('leave_room',{user_id:my_id});
        socket.emit('disconnect_chat',{chat_hash:chat_hash});
        $(location).attr('href','../');
      }
    }
  	return false;
  });


  // Disable/Enable partner webcam
  socket.on('toggle_video_disabled',function(data) {
    if ( data['user_id'] == partner_id ) {
      partner_video_disabled = data['disabled'];
    }
    if ( data['user_id'] == partner_id && onchat ) {
      if ( partner_video_disabled ) {
        $("#partner-webcam").removeAttr('src');
      } else {
        $('#partner-webcam').prop('src', URL.createObjectURL(partner_stream));
      }
    }
  })

  // Send video stream to the admin
  socket.on('get_video_stream',function(data) {
    if ( data['chat_hash'] == chat_hash ) {
      peer.call(data['peer'], window.localStream);
    }
  });

  // Change partner resolution
  socket.on('change_video_quality',function(data) {
    if ( data['partner_id'] == my_id ) {
      ChangeResolution(data['resolution']);
      constraints['video']['mandatory']['minFrameRate'] = data['bit_rate'] != '' ? data['bit_rate'] : bit_rate;
      constraints['video']['mandatory']['maxFrameRate'] = data['bit_rate'] != '' ? data['bit_rate'] : bit_rate;
      initializeCamera(data['peer']);

      // Close other stream except use stream
      for(var x  in peer.connections[partner_peer]) {
        var con = peer.connections[partner_peer][x];
        if ( con.id != window.existingCall.id ) {
          con.close();
        }
      }

    }
  })

  // Disable start chat when room mate leave
  socket.on('remove_room_mate',function(data) {
  	if ( data['partner'] == partner_id ) {
      $(".btn-start-chat").attr('disabled','disabled');
      $(".btn-start-chat").addClass('disable');
  	}
  });

  // Nofify user join
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


  // Update chat hash
  socket.on('append_chathash',function(data) {
  	if ( data['sender_id'] == my_id || data['recipient_id'] == my_id ) {
  		chat_hash = data['chat_hash'];
      $(".btn-start-chat").attr('disabled','disabled');
      $(".btn-start-chat").addClass('disable');
  	}
  });

  // Notify user that chat partner is disconnected
  socket.on('notify_disconnect_chat_partner',function(data) {
    if ( data['chat_hash'] == chat_hash && data['user_id'] == partner_id) {
  		var message = '<div class="message">Server: <span style="color:blue;">'+partner_name+' may also reconnect from this chat so please wait for a while</span></div>';
  		message += '<div class="message">Server: <span style="color:red;">'+partner_name+' has been disconnected... Please wait until the time finish</span></div>';
  		$("#conversations .reconnecting").after(message);
  		peer.connections = {};
  	} else if ( data['chat_hash'] == chat_hash && data['user_id'] == my_id ) {
      init();
    }
  })


  // Notify user that chat is forcely kill by admin
  socket.on('notify_kill_chat',function(data) {
    if ( data['chat_hash'] == chat_hash ) {
      alert('The administrator has forcely kill your chat!');
    }
  })


  // Notify connect to the server
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
      $(".reconnecting").hide();
      init();
    } else if ( data['user_id'] == partner_id ) {
      $(".btn-start-chat").removeAttr('disabled');
      $(".btn-start-chat").removeClass('disable');
    }
  })
  // Reconnect to chat
  socket.on('reconnect_chat_partner',function(data) {
    if ( data['user_id'] == partner_id ) {
      console.log( 'reconnect!' );
      $("#conversations .reconnecting").after('<div class="message">Server: '+partner_name+' is now connected to the chat</div>');
      onchat = true;
  		$(".btn-end-chat").show();
			var peer = data['peer'];
      partner_peer = peer;
  		ReconnectToPeer(peer);
		} else if ( data['user_id'] == my_id ) {
      $("#conversations .reconnecting").after('<div class="message">Server: You are now reconnected to the chat...</div>');
      if ( data['partner'] == null ) {
        var message = '<div class="message">Server: <span style="color:blue;">'+partner_name+' may also reconnect from this chat so please wait for a while</span></div>';
        message += '<div class="message">Server: <span style="color:red;">'+partner_name+' has been disconnected... Please wait until the time finish</span></div>';
        $("#conversations .reconnecting").after(message);
      }
  	}
  })

  // End chat
  socket.on('end_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
      peer.connections = {};
      peer._cleanup();
		  chat_hash = "";
      remaining_time = data['remaining_time'];
		  onchat = false;
		  $("#conversations").html('<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>');
		  $(".btn-end-chat").hide();
		  $("#remaining-time").text('--:--');
      $(".btn-start-chat").removeAttr('disabled');
      $(".btn-start-chat").removeClass('disable');
		  $("#partner-webcam").attr('src',null);
      clearInterval(timer);
  	}
  });

  // Notify user about chat disconnection
  socket.on('notify_disconnect_chat',function(data) {
  	if ( data['chat_hash'] == chat_hash && chat_hash != "" ) {
      $(".btn-start-chat").removeAttr('disabled');
      $(".btn-start-chat").removeClass('disable');
  		if ( data['user_id'] == partner_id ) {
  			alert(data['name']+' has forcely end the chat');
  		}
    	chat_hash = "";
		  onchat = false;
		  $("#conversations").html('<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>');
		  $(".btn-end-chat").hide();
		  $("#remaining-time").text('--:--');
		  $("#partner-webcam").attr('src',null);
		  clearInterval(timer);
  	}
  })

  // Start chat time
  socket.on('start_chattime',function(data) {
  	if ( data['chat_hash'] == chat_hash ) {
      remaining_time = data['remaining_time'];

      window.onbeforeunload = leaveChatValidation;
      $(".reconnecting").hide();
      $(".btn-end-chat").show();
      onchat = true;
      clearInterval(timer);
      timer = setInterval(function() {
        remaining_time--;
        if ( remaining_time <= 0 ) {
          $("#remaining-time").text('--:--');
        } else {
          $("#remaining-time").text(convertTime(remaining_time));
        }
      },1000);

    }
  });

  // Notify user about disconnection
	socket.on('disconnect',function() {
		$(".reconnecting").show();
		$("#member-list").html("");
		console.log( 'you have disconnected!' );
	});

})