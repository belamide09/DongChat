
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

peer = new Peer({
  host: '192.168.0.187',
  port: '9000',
  path: '/',
  debug: 0
});

peerEvts();
getVideoStream();

function peerEvts() {
  peer.on('call', function(call){
    var confirmation = confirm(getName(call.peer) + ' want\'s to video chat with you');
    if ( confirmation == true ) {

      var end_chat = chat_time * 1000
      socket.emit('save_chat',{sender_peer:call.peer,recipient_id:my_id});
      call.answer(window.localStream);
      StartCall(call);

      setTimeout(function() {
        endChat(true);
      },end_chat);

    }

  });
}

function getVideoStream() {
  navigator.getUserMedia({audio: true, video: true}, function(stream){
    $('#my-webcam').prop('src', URL.createObjectURL(stream));
    window.localStream = stream;
  }, function(){ $('#step1-error').show(); });
}