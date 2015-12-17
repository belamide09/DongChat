var peer;
var c;
var onchat     = false;
var chat_time  = 300;
var remaining_time  = chat_time;
var room_members    = {};
var timer;
var partner_id;
var partner_video_disabled = 0;
var chat_hash = "";
var partner_stream;

var constraints = {
  audio: true,
  video: {
  mandatory: {
    minWidth: 360,
    minHeight: 360,
    maxWidth: 360,
    maxHeight: 360,
    minFrameRate: 1,
    maxFrameRate: 30
  }
}};

function onsuccess(stream) {
}


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
    socket.emit('add_onair_user',{user_id:my_id,peer_id:id});
  }); 
}

function initializeCamera(call_peer) {
  navigator.getUserMedia = (  navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia || navigator.msGetUserMedia );
  navigator.getUserMedia(constraints, function(stream){
    console.warn('Connected to camera'); 
    if ( typeof $("#my-webcam").attr('src') == 'undefined' ) {
      $('#my-webcam').prop('src', URL.createObjectURL(stream));
    }
    if ( call_peer ) {
      setTimeout(function() {
        peer.call(call_peer, window.localStream);
      },1000);
    }
    window.localStream = stream;
  }, function(error) {
    console.warn(error);
  });
}

function ChangeResolution(value) {  
  constraints['video']['mandatory']['minWidth']   = value;
  constraints['video']['mandatory']['minHeight']  = value;
  constraints['video']['mandatory']['maxWidth']   = value;
  constraints['video']['mandatory']['maxHeight']  = value;
}

function ReconnectToPeer(peer_id) {
  var call = peer.call(peer_id, window.localStream);
  StartCall(call);
}

function Call() {
	var url = 'VideoCall/getPeer';
	$.post(url,{user_id:partner_id},function(data) {
	  var call = peer.call(data['peer'], window.localStream);
	  StartCall(call);
	},'JSON');
}

function StartCall(call) {
  if (window.existingCall) {
    window.existingCall.close();
  }
  call.on('stream', function(stream) {
    partner_stream = stream;
    if ( !partner_video_disabled ) {
      $('#partner-webcam').prop('src', URL.createObjectURL(stream));
    }
  });
  window.existingCall = call;
}

function endChat() {
  socket.emit('end_chat',{user_id:my_id,ended:true});
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

function StartTime() {
  window.onbeforeunload = leaveChatValidation;
  $(".reconnecting").hide();
  $(".btn-end-chat").show();
  onchat = true;
  clearInterval(timer);
  timer = setInterval(function() {
    remaining_time--;
    $("#remaining-time").text(convertTime(remaining_time));
    if ( remaining_time <= 0 ) {
      remaining_time = chat_time;
      onchat = false;
      $("#remaining-time").text('--:--');
      socket.emit('end_chat',{user_id:my_id});
      clearInterval(timer);
    }
  },1000);
}

function leaveChatValidation() {
  if ( onchat ) { 
    return 'You are still chatting with someone. You can only leave after chatting';
  }
}