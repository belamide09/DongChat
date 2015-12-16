
var peer;
var c;
$(document).ready(function() {

  navigator.getUserMedia = ( navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||navigator.msGetUserMedia);
  var video_constraints = {
    mandatory: {
      maxHeight: 360,
      minHeight: 360,
      maxWidth: 360,
      minWidth: 360,
      maxFrameRate: 30,
      minFrameRate: 1
   },
   optional: []
  };

  setVideoSettings();

  function setVideoSettings() {
    console.warn('Conntecting to camera');
    navigator.getUserMedia({
       audio: false,
       video: video_constraints
    }, onsuccess,function(){});
  }

  function onsuccess(stream) {
    console.warn('Connected to camera');
  }


  peer = new Peer({
    host: location.origin.split('//')[1],
    port: '4500',
    path: '/',
    debug: 2
  });

  getVideoStream();
  
  function getVideoStream() {
    navigator.getUserMedia({audio: true, video: true}, function(stream){
      $('#my-webcam').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
    }, function(){ $('#step1-error').show(); });
  }

});