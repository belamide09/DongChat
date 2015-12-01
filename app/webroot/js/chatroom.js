
var chat_hash       = "";
var peer;
var c;
var onchat          = false;
var chat_time       = 300;
var remaining_time  = chat_time;
var group_members   = {};

// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

peer = new Peer({
  host: '192.168.0.187',
  port: '9000',
  path: '/',
  debug: 0
});

peer.on('open', function(peer_id){

  setTimeout(function() {
    socket.emit('add_onair_user',{user_id:my_id,peer_id:peer_id});
    socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
  },1000);

});
peerEvts();
getVideoStream();

function peerEvts() {
  peer.on('call', function(call){
    call.answer(window.localStream);
    StartCall(call);
  });
  peer.on('connection', connect);
}

function connect(c) {
  if (c.label === 'chat') {
    c.on('data', function(data) {
      console.log( data );
    });
    c.on('close', function() {
      console.log( 'connection died' );
    });
  }
}


function getVideoStream() {
  navigator.getUserMedia({audio: true, video: true}, function(stream){
    $('#my-webcam').prop('src', URL.createObjectURL(stream));
    window.localStream = stream;
  }, function(){ $('#step1-error').show(); });
}


function PrepareCall(requestedPeer) {
  c = peer.connect(requestedPeer, {
    label: 'chat',
    serialization: 'none',
    metadata: {message: 'hi i want to chat with you!'}
  });
  peer.on('connection', connect);
  var call = peer.call(requestedPeer, window.localStream);
  StartCall(call);
}

function StartGroupChat() {
  for(var x in group_members) {
    var member = group_members[x];
    PrepareCall(group_members[x]['peer']);
  }
}

function StartCall(call) { 
  if (window.existingCall) {
    window.existingCall.close();
  }
  call.on('stream', function(stream){
    $('.video-'+call.peer).prop('src', URL.createObjectURL(stream));
  });
  window.existingCall = call;
}


function endChat(ended) {
  socket.emit('end_chat',{user_id:my_id,ended: ended});
}

function eachActiveConnection(fn) {
  for(var peer_id in peer.connections) {
    var conns = peer.connections[peer_id];
    for (var i = 0, ii = conns.length; i < ii; i += 1) {
      var conn = conns[i];
      fn(conn, $(this));
    }
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

// Make sure things clean up properly.

window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};