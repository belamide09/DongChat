
var peer;
var c;
$(document).ready(function() {
  // Compatibility shim
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  peer = new Peer({
    host: location.origin.split('//')[1],
    port: '4500',
    path: '/',
    debug: 0
  });

  getVideoStream();
  
  function getVideoStream() {
    navigator.getUserMedia({audio: true, video: true}, function(stream){
      $('#my-webcam').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
    }, function(){ $('#step1-error').show(); });
  }

});