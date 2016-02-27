var Room = (function() {
	var Public = {}; //Public or Accesible outside
	var room = room_id;
	var chat_time = 300;
	var peer = null;
	var conn = null;
	var timer = null;
	var sec = 0;
	var resolution = 360;
	var bit_rate = 30;
	var partner_peer = '';
	var config = {
    host: 'localhost',
    port: '4500',
    path: '/',
    debug: 2
  };

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

	Public.init = function() {
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
			partner_peer = call.peer;
		  call.answer(window.localStream);
			call.on('stream',function(stream){setPartnerVideo(stream);})
			receiveMessage(call.peer);
	  });
	  peer.on('open',function(peer_id) {
	  	RoomEmit.addOnAir(peer_id);
	  })
	};
	Public.toggle_video = function(t) {
		RoomEmit.toggle_video(t);
	};
	Public.changeResolution = function(r) {
		resolution = r;
		var data = {
      partner_id: partner_id,
      peer 			: peer.id,
      resolution: resolution,
      bit_rate: bit_rate
    }
		RoomEmit.changeVideoQuality(data);
	};
	Public.changeBitRate = function() {
		var data = {
      partner_id: partner_id,
      peer 			: peer.id,
      resolution: resolution,
      bit_rate: bit_rate
    }
		RoomEmit.changeVideoQuality(data);
	};
	Public.changeVideoQuality = function(data) {
		changeMyResolution(data.resolution);
		changeMyBitRate(data.bit_rate);
		partner_peer = data.peer;
		navigator.getUserMedia = (  navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                            		navigator.mozGetUserMedia || navigator.msGetUserMedia );
		navigator.getUserMedia(constraints,applyVideoQuality,errorMedia);
	};
	var applyVideoQuality = function(stream) {
		localStream = stream;
		closePreviousConnection();
		peer.call(partner_peer,stream);
		receiveMessage(partner_peer);
	};
	var changeMyResolution = function(r) {
		constraints.video.mandatory.minWidth   = r;
	  constraints.video.mandatory.minHeight  = r;
	  constraints.video.mandatory.maxWidth   = r;
	  constraints.video.mandatory.maxHeight  = r;
	};
	Public.changeBitRateValue = function(br) {
		bit_rate = br;
	};
	var changeMyBitRate = function(br) {
		constraints.video.mandatory.minFrameRate = br != '' ? br : bit_rate;
    constraints.video.mandatory.maxFrameRate = br != '' ? br : bit_rate;
	};
	Public.call = function(peer_id) {
		var call = peer.call(peer_id,localStream);
		partner_peer = peer_id;
		window.existingCall = call;
		call.on('stream',function(stream){setPartnerVideo(stream);})
		receiveMessage(call.peer);
	};
	Public.save_chat = function() {
		RoomEmit.save_chat();
	};
	var closePreviousConnection = function() {
		var conns = peer.connections;
		var peer_id = Object.keys(conns)[0];
    for(var x  in peer.connections[peer_id]) {
      var con = peer.connections[peer_id][x];
      if(con.type == 'media' && con.id != window.existingCall.id){
        con.close();
      }
    }
	};
	Public.sendMessage = function(msg) {
		if(!jQuery.isEmptyObject(peer.connections)){
			RoomEmit.sendMessage(partner_peer,msg);
		}
	};
	var receiveMessage = function(peer_id) {
		if(conn != null)conn.close();
		conn = peer.connect(peer_id);
		conn.on('open',function() {
			conn.on('data',function(msg) {
				ReceiveMessage({sender:partner_name,msg:msg});
			});
		})
	};
	Public.startTime = function(s) {
		sec = s;
		if(timer != null)clearInterval(timer);		
		timer = setInterval(function() {
			sec--;
			setRemainingTime(sec);
		},1000);
	};
	Public.endChat = function() {
		peer.connections = {};
    peer._cleanup();
    sec = chat_time;
    endChat();
    clearInterval(timer);
	};
	Public.leaveRoom = function(location) {
		RoomEmit.leaveRoom(location);
	};
	Public.getPeer = function() {
		return peer;
	};
	setVideoControls();
	return Public;
})();