
var peer;
var c;
// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

peer = new Peer({
  host: '192.168.0.187',
  port: '9000',
  path: '/',
  debug: 0
});

peer.on('open', function(peer_id){

 socket.emit('add_onair_user',{user_id:my_id,peer_id:peer_id});

});
peerEvts();
getVideoStream();

function peerEvts() {
  peer.on('call', function(call){
    var c = confirmation = confirm(call.peer + ' want\'s to video chat with you');
    if ( c == true ) {
      socket.emit('save_chat',{sender_peer:call.peer,recipient_id:my_id});
      call.answer(window.localStream);
      StartCall(call);
    }
  });
  peer.on('error', function(err){
  });

  peer.on('connection', connect);

  peer.on('error', function(err) {
  })
}

function connect(c) {
  c.on('close', function() {
    window.existingCall.close();
  });
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
  c.on('open', function() {
    connect(c);
  });
  c.on('error', function(err) { alert(err); });
  var call = peer.call(requestedPeer, window.localStream);
  StartCall(call);
  console.log( call );
}

function Call(user_id) {
  var url = '/ChatRoom/getPeer';
  $.post(url,{user_id,user_id},function(data) {
    PrepareCall(data['peer']);
  },'JSON');
}

function StartCall (call) { 
  if (window.existingCall) {
    window.existingCall.close();
  }
  call.on('stream', function(stream){
    $('#partner-webcam').prop('src', URL.createObjectURL(stream));
  });
  window.existingCall = call;
  conn = peer.connect(call.peer);
}

// Make sure things clean up properly.

window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};