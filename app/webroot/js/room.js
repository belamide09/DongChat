var Room = function() {
	var R = {}; // Room
	var E = {}; // Emit
	var peer;
	var conn = null;
	var receiver = {};
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


	// function for Room
	R.init = function() {
		if ( typeof peer.connections != 'undefined' ) {
			peer.connections = {};
			peer._cleanup();
		}
		peer = new Peer(config);
		setPeerListener();
		initializeCamera();
	};
	R.initializeCamera = function() {
		navigator.getUserMedia = (  navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                              	navigator.mozGetUserMedia || navigator.msGetUserMedia );
		navigator.getUserMedia(constraints,setMyStream,errorMedia);
	};
	R.setMyStream = function() {
		function(stream) {
			window.localStream = stream;
			setMyVideo();
		}
	};
	R.errorMedia = function(error) {
		displayErrorMedia(error);
	};
	R.setPeerListener = function() {
		peer.on('call', function(call) {
	    partner_peer = call.peer;
		  var call.answer(window.localStream);
			receiveMessage(call.peer);
	  });
	  peer.on('open',function(peer_id) {
	  	E.addOnAir(peer_id);
	  })
	};
	R.call = function(to_call) {
		var call = peer.call(to_call,localStream);
	};
	R.startCall = function(call) {
		window.existingCall = call;
		call.on('stream',function(stream) {
			setPartnerVideo();
		})
	};
	R.sendMessage = function(msg) {
		var last_index = peer.connections[partner_peer].length - 1;
    var dist = peer.connections[partner_peer][last_index];
    dist.send(msg);
	};
	R.receiveMessage = function(peer_id) {
		// Close existing connection
		if (conn != null) conn.close();
		conn = peer.connect(peer_id);
		conn.on('open',function() {
			//Receive message
			conn.on('data',function(data) {
				ReceiveMessage(data);
			});
		})
	}
}