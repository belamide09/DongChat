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
	this.enable_camera = function(t) {
		socket.emit('enable_camera',{enable:t});
	};
	this.save_chat = function() {
		var params = {
			sender_id: user_id,
			recipient_id: partner_id
		}
		socket.emit('save_chat',params);
	};
	this.sendMessage = function(msg) {
		var peer = myRoom.getPeer();
		var conns = peer.connections;
		var peer_id = Object.keys(conns)[0];
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
		myRoom.init();
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
    }
  });
  socket.on('end_chat',function(data) {
  	if(data['chat_hash'] == chat_hash){
  		chat_hash = null;
  		myRoom.endChat();
  	}
  });
  socket.on('reconnect_chat_partner',function(data) {
    if(data['user_id'] == partner_id){
    	myRoom.call(data['peer']);
			reconnectPartner();
		}else if(data['user_id'] == my_id){
			$("#conversations .reconnecting").after('<div class="message">Server: You are now reconnected to the chat...</div>');
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
  })
};