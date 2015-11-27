
var peer;
var c;
$(document).ready(function() {

  $('#their-video-volume').slider({
    orientation: "vertical",
    value: 1,
    min: 0,
    max: 1,
    range: 'min',
    animate: true,
    step: .1,
    slide: function() {
      var volume = $('#their-video-volume').slider('value');
      if ( volume == 0.1 ) {
        volume = 0;
      }
      $("#their-video")[0].volume = volume;
    }
  });

  // Compatibility shim
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var peer_id = Math.random().toString();
  peer_id = peer_id.substring(2,5);
  peer = new Peer(peer_id,{
    host: '192.168.0.187',
    port: '9000',
    path: '/',
    debug: 0
  });

  // Show this peer's ID.
  peer.on('open', function(id){
    addOnline();  
  });
  peerEvts();
  getVideoStream();

  function peerEvts() {
    // Receiving a call
    peer.on('call', function(call){
      // Answer the call automatically (instead of prompting user)
      call.answer(window.localStream);
      startCall(call);
    });
    peer.on('error', function(err){
      // alert(err.message);
    });

    // Await connections from others
    peer.on('connection', connect);

    peer.on('error', function(err) {
      console.log(err);
    })

    // Show this peer's ID.
    peer.on('open', function(id){
      $('#my-id').text(id);
    });
  }

  function connect(c) {

  }

  
  function getVideoStream() {
    navigator.getUserMedia({audio: true, video: true}, function(stream){
      $('#my-webcam').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
    }, function(){ $('#step1-error').show(); });
  }

  function addOnline() {
    var url = '/Room/addOnlineUser';
    $.post(url,{peer:peer.id});
  }

});

// Make sure things clean up properly.

window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};