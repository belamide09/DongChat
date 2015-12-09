var peer;
var c;
var onchat     = false;
var chat_time  = 300;
var remaining_time  = chat_time;
var room_members    = {};
var timer;	
var partner_id;
var chat_hash = "";

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function init() {
  if ( typeof peer != 'undefined' ) {
    peer.connections = {};
    peer._cleanup();
  }
  peer = new Peer({
    host: location.origin.split('//')[1],
    port: '4500',
    path: '/',
    debug: 0
  });
  peerEvts();
  getVideoStream();
}

function peerEvts() {
  peer.on('call', function(call) {

  	if ( chat_hash == '' ) {
	  	var url = 'VideoCall/getName';
	  	$.post(url,{peer:call.peer},function(data) {

	  		var confirmation = confirm(data['name']+' want\'s to video chat with you');
	  		if ( confirmation == true ) {

	  			partner_id = data['id'];
		  		var end_chat = chat_time * 1000
				  socket.emit('save_chat',{sender_peer:call.peer,recipient_id:my_id});
				  call.answer(window.localStream);
				  StartCall(call);

				  setTimeout(function() {
				    endChat(true);
				  },end_chat);

				}

	  	},'JSON');
	  } else {
	  	call.answer(window.localStream);
		  StartCall(call);
	  }

  });
  peer.on('open',function(id) {
    console.log( id );
    socket.emit('add_onair_user',{user_id:my_id,room_id:room_id,peer_id:id,video_chat:true});
  }); 
}

function getVideoStream() {
  navigator.getUserMedia({audio: true, video: true}, function(stream){
    $('#my-webcam').prop('src', URL.createObjectURL(stream));
    window.localStream = stream;
    socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
  }, function(){ $('#step1-error').show(); });
}

function Connect(c) {
  if (c.label == 'chat' ) {
    c.on('data',function(msg) {
      var message = '<div class="message">Chat Mate: '+msg+'</div>';
      $("#conversations .reconnecting").after(message);
    })
  }
}

function ReconnectToPeer(peer_id) {
  var call = peer.call(peer_id, window.localStream);
  StartCall(call);
}

function Call(user_id) {
	var url = 'VideoCall/getPeer';
	$.post(url,{user_id:user_id},function(data) {

		partner_id = user_id;
	  var call = peer.call(data['peer'], window.localStream);
	  StartCall(call);

	},'JSON');
}

function StartCall(call) {
  var conn = peer.connect(call.peer, {
    label: 'chat'
  });
  Connect(conn);
  if (window.existingCall) {
    window.existingCall.close();
  }
  call.on('stream', function(stream){
    $('#partner-webcam').prop('src', URL.createObjectURL(stream));
  });
  window.existingCall = call;
}

function endChat() {
  socket.emit('end_chat',{user_id:my_id,ended:true});
}

function ClosePeer() {
  peer.connections = {};
  for(var peer_id in peer.connections) {
    peer._cleanupPeer(peer_id)
  }
}

function convertTime(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time % 60;
  if ( minutes < 10 ) {
    minutes = '0'+minutes;
  }
  if ( seconds < 10 ) {
    seconds = '0'+seconds;
  }
  return minutes+":"+seconds;
}