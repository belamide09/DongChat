var RoomEmit = function() {
	var user_id = my_id;
	var chat_hash = null;
	var onchat = false;
	var query = {query:"user_id="+my_id+"&room_id="+room_id+"&name="+my_name+"&partner_type="+partner_type};
	var socket = io.connect(location.origin+':4000',query);

	// Add user onair table
	this.addOnAir = function(peer_id) {
		socket.emit('add_onair_user',{user_id:user_id,peer_id:peer_id});
	};
	this.toggle_video = function(t) {
		socket.emit('toggle_video',{user_id:user_id,enable:t});
	};
	this.changeVideoQuality = function(data) {
    socket.emit('change_video_quality',data);
	};
	this.changeBitRate = function(data) {
		socket.emit('change_video_quality',data);
	}
	this.save_chat = function() {
		var params = {
			sender_id: user_id,
			recipient_id: partner_id
		}
		socket.emit('save_chat',params);
	};
	this.onchat = function() {
		return onchat;
	};
	this.sendMessage = function(peer_id,msg) {
		var peer = myRoom.getPeer();
		var conns = peer.connections;
		conns = conns[peer_id];
		var last_index = conns.length - 1;
    var dist = conns[last_index];
    dist.send(msg);
	};
	this.leaveRoom = function() {
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
    $(location).attr('href','../');
	}
	socket.on('connect_server',function(data) {
    if(chat_hash && data['chat_hash'] == chat_hash){
      enableStart(false);
    }
    if(data['user_id'] == user_id || data['user_id'] != partner_id){
      var t = localStorage.enable_video == 'true' ? true : false;
      var p = {user_id:user_id,enable:t};
      socket.emit('toggle_video',p);
    }
    if(data['user_id'] == user_id && data['chat_hash'] != ''){
      ReconnectMeServer();
      myRoom.init();
    }else if(data['user_id'] == user_id){
      hideReconnectLoader();
      myRoom.init();
    }else if(data['user_id'] == partner_id){
      enableStart(true);
    }
    
	})
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
  		myRoom.startTime(data['remaining_time']);
      window.onbeforeunload = leaveChatValidation;
    }
  });
  socket.on('end_chat',function(data) {
  	if(data['chat_hash'] == chat_hash){
  		chat_hash = null;
      onchat = false;
  		myRoom.endChat();
  	}
  });
  socket.on('reconnect_chat_partner',function(data) {
    if(data['user_id'] == partner_id){
    	myRoom.call(data['peer']);
			reconnectPartner();
		}else if(data['user_id'] == my_id){
			var message = '<div class="message">Server: You are now reconnected to the chat...</div>';
			$("#conversations .reconnecting").after(message);
      if(data['partner'] == null)NotifyDisconnectPartner();
		}
  })
  socket.on('notify_disconnect_chat',function(data) {
  	if(data['chat_hash'] == chat_hash && chat_hash){
  		if(data['user_id'] == partner_id){
  			alert(data['name']+' has forcely end the chat');
  		}
     	enableStart(true);
    	chat_hash = null;
		  onchat = false;
		  myRoom.endChat();
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
    	myRoom.changeVideoQuality({resolution:data['resolution'],bit_rate:data['bit_rate'],peer:data['peer']});
    }
  });
};