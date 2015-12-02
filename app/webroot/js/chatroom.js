
var chat_hash = "";
var peer;
var c;
var onchat     = false;
var chat_time  = 300;
var remaining_time  = chat_time;
var room_members    = {};
var connected_peer;
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
    socket.emit('add_onair_user',{user_id:my_id,room_id:room_id,peer_id:peer_id});
    socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});
  },1000);

});
peerEvts();
getVideoStream();

function peerEvts() {
  peer.on('call', function(call){
    var url = '/ChatRoom/getName';
    $.post(url,{peer:call.peer},function(data) {
      var confirmation = confirm(data['name'] + ' want\'s to video chat with you');
      if ( confirmation == true ) {

        peer.on('connection', connect);

        var end_chat = chat_time * 1000
        socket.emit('save_chat',{sender_peer:call.peer,recipient_id:my_id});
        call.answer(window.localStream);
        StartCall(call);

        setTimeout(function() {
          endChat(true);
        },end_chat);

      }
    },'JSON');
  });
}

function connect(c) {
  if ( c.label == 'chat' && typeof c != 'undefined') {
    c.on('data', function(msg) {
      var message = getName(c.peer)+' - '+msg;
      message = '<div class="message">'+message+'</div>';
      $("#conversations").append(message);
    });
    c.on('close', function() {
      endChat();
      window.existingCall.close();
    });
  }
}

function connectPeer(peer_id) {
  var conn = peer.connect(peer_id, {
    label: 'chat',
    serialization: 'none',
    metadata: {message: 'hi i want to chat with you!'}
  });
  connect(conn);
}

function peerEvents() {
  for(var peer_id in peer.connections) {

    for(var x in peer.connections[peer_id]) {
      if ( peer.connections[peer_id][x].label == 'chat' ) {
        var conn = peer.connections[peer_id][x];
        connect(conn);
      }
    }

  }
}

function SendMessage(msg) {
  var message = my_name+' - '+msg;
  message = '<div class="message">'+message+'</div>';
  $("#conversations").append(message);
  for(var peer_id in peer.connections) {
    for(var x in peer.connections[peer_id]) {
      if ( peer.connections[peer_id][x].label == 'chat' ) {
        peer.connections[peer_id][x].send(msg);
      }
    }
  }
}

function getVideoStream() {
  navigator.getUserMedia({audio: true, video: true}, function(stream){
    $('#my-webcam').prop('src', URL.createObjectURL(stream));
    window.localStream = stream;
  }, function(){ $('#step1-error').show(); });
}


function PrepareCall(requestedPeer) {
  var call = peer.call(requestedPeer, window.localStream);
  StartCall(call);
}

function Call(user_id) {
  var url = '/ChatRoom/getPeer';
  $.post(url,{user_id,user_id},function(data) {
    connected_peer = data['peer'];
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
}

function endChat(ended) {
  socket.emit('end_chat',{user_id:my_id,ended: ended});
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

function getName(peer_id) {
  var name = "";
  for(var x in room_members) {
    if ( room_members[x]['peer'] == peer_id ) {
      name = room_members[x]['name'];
    }
  }
  return name;
}

// Make sure things clean up properly.

window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};