var peer;
var onchat     = false;
var partner_id;
var partner_video_disabled = 0;
var partner_peer = null;
var chat_hash = "";
var partner_stream;
var resolution = 360;
var bit_rate = 30;
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

// Initialize peer
function init() {
  if ( typeof peer != 'undefined' ) {
    peer.connections = {};
    peer._cleanup();
  }
  peer = new Peer({
    host: location.origin.split('//')[1],
    port: '4500',
    path: '/',
    debug: 2
  });
  peerEvts();
  initializeCamera('');
}

// Peer events
function peerEvts() {
  peer.on('call', function(call) {
    partner_peer = call.peer;
	  call.answer(window.localStream);
		StartCall(call);
  });
  peer.on('open',function(id) {
    socket.emit('add_onair_user',{user_id:my_id,peer_id:id});
  });
}

// Initialize video optional call_peer( Call peer when not empty )
function initializeCamera(call_peer) {
  navigator.getUserMedia = (  navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia || navigator.msGetUserMedia );
  navigator.getUserMedia(constraints, function(stream) {
    console.warn('Connected to camera'); 
    if ( typeof $("#my-webcam").attr('src') == 'undefined' ) {
      $('#my-webcam').prop('src', URL.createObjectURL(stream));
    }
    if ( call_peer && onchat ) {
      setTimeout(function() {
        peer.call(call_peer, stream);
      },500);
    }
    window.localStream = stream;
  }, function(error) {
    console.warn(error);
  });
}


// Change constraint value
function ChangeResolution(value) {  
  constraints['video']['mandatory']['minWidth']   = value;
  constraints['video']['mandatory']['minHeight']  = value;
  constraints['video']['mandatory']['maxWidth']   = value;
  constraints['video']['mandatory']['maxHeight']  = value;
}

// Reconnect to peer
function ReconnectToPeer(peer_id) {
  var call = peer.call(peer_id, window.localStream);
  StartCall(call);
}

// Cal partner
function Call() {
	var url = 'VideoCall/getPeer';
	$.post(url,{user_id:partner_id},function(data) {
    partner_peer = data['peer'];
	  var call = peer.call(data['peer'], window.localStream);
	  StartCall(call);
	},'JSON');
}

// Start call
function StartCall(call) {
  window.existingCall = call;
  call.on('stream', function(stream) {
    partner_stream = stream;
    if ( !partner_video_disabled ) {
      $('#partner-webcam').prop('src', URL.createObjectURL(stream));
    }
  });
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

function leaveChatValidation() {
  if ( onchat ) { 
    return 'You are still chatting with someone. You can only leave after chatting';
  }
}