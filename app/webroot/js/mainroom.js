
var peer;
var c;
$(document).ready(function() {

  navigator.getUserMedia = (  navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia || navigator.msGetUserMedia );
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

  function setVideoSettings() {
    console.warn('Connecting to camera');
    navigator.getUserMedia(constraints,onsuccess,function(){});
  }

  function onsuccess(stream) {
    console.warn('Connected to camera');
  }

  setVideoSettings();

  peer = new Peer({
    host: 'localhost',
    port: '4500',
    path: '/',
    debug: 2
  });

  getVideoStream();
  
  function getVideoStream() {
    navigator.getUserMedia(constraints,function(stream){
      $('#my-webcam').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
    }, function(){ $('#step1-error').show(); });
  }

});