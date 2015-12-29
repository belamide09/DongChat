var Room = function() {
	var room = room_id;
	var chat_time = 300;
	var peer = null;
	var conn = null;
	var timer = null;
	var sec = 0;
	var config = {
    host: location.origin.split('//')[1],
    port: '4500',
    path: '/',
    debug: 2
  };
  // Video controls
  var constraints = {
	  audio: true,
	  video: {
	  mandatory: {
	    minWidth: 360,
	    minHeight: 360,
	    maxWidth: 360,
	    maxHeight: 360,
	    minFrameRate: 30,
	    maxFrameRate: 30
	  }
	}};

	this.init = function() {
		if(peer != null){
	    peer.connections = {};
	    peer._cleanup();
	  }
		peer = new Peer(config);
		setPeerListener();
		initializeCamera();
	};
	var initializeCamera = function() {
		navigator.getUserMedia = (  navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                              	navigator.mozGetUserMedia || navigator.msGetUserMedia );
		navigator.getUserMedia(constraints,setMyStream,errorMedia);
	};
	var setVideoControls = function() {
		localStorage.setItem('enable_video',true);
	}
	var setMyStream = function(stream) {
		window.localStream = stream;
		setMyVideo();
	};
	var errorMedia = function(error) {
		displayErrorMedia(error);
	};
	var setPeerListener = function() {
		peer.on('call', function(call) {
			window.existingCall = call;
		  call.answer(window.localStream);
			call.on('stream',function(stream){setPartnerVideo();})
			receiveMessage(call.peer);
	  });
	  peer.on('open',function(peer_id) {
	  	myEmit.addOnAir(peer_id);
	  })
	};
	this.call = function(peer_id) {
		var call = peer.call(peer_id,localStream);
		window.existingCall = call;
		call.on('stream',function(stream){setPartnerVideo();})
		receiveMessage(call.peer);
	};
	this.save_chat = function() {
		myEmit.save_chat();
	}
	this.sendMessage = function(msg) {
		if(!jQuery.isEmptyObject(peer.connections))myEmit.sendMessage(msg);
	};
	var receiveMessage = function(peer_id) {
		// Close existing connection
		if (conn != null)conn.close();
		conn = peer.connect(peer_id);
		conn.on('open',function() {
			//Receive message
			conn.on('data',function(msg) {
				ReceiveMessage({sender:partner_name,msg:msg});
			});
		})
	};
	this.startTime = function(s) {
		sec = s;
		if(timer != null)clearInterval(timer);		
		timer = setInterval(function() {
			sec--;
			setRemainingTime(sec);
		},1000);
	};
	this.endChat = function() {
		peer.connections = {};
    peer._cleanup();
    sec = chat_time;
    endChat();
    clearInterval(timer);
	};
	this.leaveRoom = function() {
		myEmit.leaveRoom();
	};
	this.getPeer = function() {
		return peer;
	};

	setVideoControls();

};