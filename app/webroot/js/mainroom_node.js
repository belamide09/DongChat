
var socket = io.connect(location.origin+':4000');
$(document).ready(function () {

	socket.emit('get_messages',{user_id:my_id});
	socket.emit('get_all_rooms',{user_id:my_id});
	$(".btn-new-room").click(function() {
		socket.emit('create_room',{user_id:my_id,name:my_name});
		$(location).attr('href','/dongdong/VideoCall');
	})

	socket.on('return_rooms',function(data) {
		var room_container = "<ul>";
		for(var x in data) {
			var row = data[x];
			room_container += '<li class="room-'+row['id']+'"><div class="room">';
			room_container += '<span class="btn btn-primary btn-xs btn-join" onclick="JoinRoom('+row['id']+')">Join</span>';
			room_container += '<div class="room-description">'+row['user']['name']+'</div>';
			room_container += '</div></li>';
		}
		room_container += "</ul>";
		$("#room-list").html(room_container);
	})

	socket.on('append_new_room',function(data) {
		var room_container = "";
		room_container = '<li class="room-'+data['id']+'"><div class="room">';
		room_container += '<span class="btn btn-primary btn-xs btn-join" onclick="JoinRoom('+data['id']+')">Join</span>';
		room_container += '<div class="room-description">'+data['name']+'</div>';
		room_container += '</div></li>';
		$("#room-list ul").append(room_container);
	})

	socket.on('remove_room',function(data) {
		$(".room-"+data['room_id']).remove();
	});

	socket.on('append_message',function(data) {

		var message = data['name']+' - '+data['message'];
		var message = '<div class="message">'+message+'</div>';
		$("#conversations").prepend(message);

	})

});

function JoinRoom(room_id) {
	socket.emit('join_room',{room_id: room_id,user_id: my_id,name: my_name});
	$(location).attr('href','/dongdong/VideoCall');
}