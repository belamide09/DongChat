var RoomEmit = (function() {
  var Public = {}; //Public or Accesible outside
  var user_id = my_id;
	var chat_hash = null;
	var onchat = false;
	var query = {query:"user_id="+my_id+"&room_id="+room_id+"&name="+my_name+"&partner_type="+partner_type};
	var socket = io.connect('https://localhost:4000',query);


	// Add user onair table
  Public.addOnAir = function(peer_id) {
		socket.emit('add_onair_user',{user_id:user_id,peer_id:peer_id});
	};
	Public.toggle_video = function(t) {
		socket.emit('toggle_video',{user_id:user_id,enable:t});
	};
	Public.changeVideoQuality = function(data) {
    socket.emit('change_video_quality',data);
	};
	Public.changeBitRate = function(data) {
		socket.emit('change_video_quality',data);
	}
	Public.save_chat = function() {
		var params = {
			sender_id: user_id,
			recipient_id: partner_id
		}
		socket.emit('save_chat',params);
	};
	Public.onchat = function() {
		return onchat;
	};
	Public.sendMessage = function(peer_id,msg) {
		var peer = Room.getPeer();
		var conns = peer.connections;
		conns = conns[peer_id];
		var last_index = conns.length - 1;
    var dist = conns[last_index];
    dist.send(msg);
	};
	Public.leaveRoom = function() {
		if(onchat){
	  	var flag = confirm('You are still chatting with someone. You can only leave after chatting.\nAre you sure you want to leave this room?');
	  	if(flag)leave();
	  }else{
      var flag = confirm('Are you sure you want to leave this room?');
      if(flag)leave();
    }
	};
	var leave = function() {
    socket.emit('leave_room',{user_id:my_id});
    socket.emit('disconnect_chat',{chat_hash:chat_hash});
    redirectToMain();
	}
	socket.on('connect_server',function(data) {
    if(chat_hash && data['chat_hash'] == chat_hash && partner_id != ""){
      enableStart(false);
    }
    if(data['user_id'] == user_id || data['user_id'] != partner_id){
      var t = localStorage.enable_video == 'true' ? true : false;
      var p = {user_id:user_id,enable:t};
      socket.emit('toggle_video',p);
    }
    if(data['user_id'] == user_id && data['chat_hash'] != ''){
      ReconnectMeServer();
      Room.init();
    }else if(data['user_id'] == user_id){
      hideReconnectLoader();
      Room.init();
    }else if(data['user_id'] == partner_id){
      enableStart(true);
    }
    
	})
  socket.on('append_new_member',function(data){
    if(data.room_id == room_id){
      partner_name = data.name;
      partner_id = data.user_id;
      enableStart(true);
    }
  });
  socket.on('append_chathash',function(data) {
  	var condition = data['sender_id'] == user_id || data['recipient_id'] == user_id;
  	if(condition){;
  		chat_hash = data['chat_hash'];
  		enableStart(false);
  	}
  });
  socket.on('start_chattime',function(data) {
  	if(data['chat_hash'] == chat_hash){
  		onchat = true;
  		Room.startTime(data['remaining_time']);
      window.onbeforeunload = leaveChatValidation;
      enableStart(false);
    }
  });
  socket.on('end_chat',function(data) {
  	if(data['chat_hash'] == chat_hash){
  		chat_hash = null;
      onchat = false;
      enableStart(true);
  		Room.endChat();
  	}
  });
  socket.on('reconnect_chat_partner',function(data) {
    if(data['user_id'] == partner_id){
    	Room.call(data['peer']);
			reconnectPartner();
      enableStart(false);
		}else if(data['user_id'] == my_id){
			var message = '<div class="message">Server: You are now reconnected to the chat...</div>';
			$("#conversations .reconnecting").after(message);
      if(data['partner'] == null)NotifyDisconnectPartner();
		}
  })
  socket.on('disable_start',function(data){
    console.log(user_id);
    if(data.user_id == partner_id){
      enableStart(false);
    }
  })
  socket.on('notify_disconnect_chat_partner',function(data){
    if(data['user_id'] == partner_id){
      NotifyDisconnectPartner();
    }
  });
  socket.on('notify_disconnect_chat',function(data) {
  	if(data['chat_hash'] == chat_hash && chat_hash){
  		if(data['user_id'] == partner_id){
  			alert(data['name']+' has forcely end the chat');
  		}
    	chat_hash = null;
		  onchat = false;
		  Room.endChat();
  	}
  });
  socket.on('toggle_video',function(data) {
    if(data['user_id'] == partner_id && onchat && window.existingCall != null){
    	localStorage.setItem('partner_camera',data['enable']);
      var stream = window.existingCall.remoteStream;
    	setPartnerVideo(stream);
    }else if(data['user_id'] == partner_id && onchat && window.existingCall == null){
      localStorage.setItem('partner_camera',data['enable']);
    }else if(data['user_id'] == partner_id && !onchat){
    	localStorage.setItem('partner_camera',data['enable']);
    }
    if(data['user_id'] == user_id){
    	localStorage.setItem('my_camera',data['enable']);
    	enableMyCamera();
    }
  });
  socket.on('change_video_quality',function(data) {
    if(data['partner_id'] == my_id){
    	Room.changeVideoQuality({resolution:data['resolution'],bit_rate:data['bit_rate'],peer:data['peer']});
    }
  });
  return Public;
})();