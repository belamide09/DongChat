
var socket = io.connect('http://192.168.0.187:3000',{query:"user_id="+my_id});
$(document).ready(function () {

	socket.emit('get_all_rooms',{user_id:my_id});

	socket.on('return_rooms',function(data) {
		if ( data['user_id'] == my_id ) {
			var data = data['results'];
			var room_container = "<ul>";
			for(var x in data) {
				var row = data[x];
				room_container += '<li class="room-'+row['id']+'"><div class="room">';
				room_container += '<span class="btn btn-primary btn-xs btn-join" onclick="JoinRoom('+data[x]['id']+')">Join</span>';
				room_container += '<div class="room-description">'+row['name']+'</div>';
				room_container += '</div></li>';
			}
			room_container += "</ul>";
			$("#room-list").html(room_container);
		}

	})

	socket.on('append_new_room',function(data) {
		if ( data['host'] != my_id ) {
			var room_container = "";
			room_container = '<li class="room-'+data['id']+'"><div class="room">';
			room_container += '<span class="btn btn-primary btn-xs btn-join" onclick="JoinRoom('+data['id']+')">Join</span>';
			room_container += '<div class="room-description">'+data['name']+'</div>';
			room_container += '</div></li>';
			$("#room-list ul").append(room_container);
		} else {
			location.reload();
		}
	})

	socket.on('redirect_user_to_room',function(data) {
		if ( data['user_id'] == my_id ) {
			location.reload();
		}
	});

	socket.on('remove_room',function(data) {
		console.log( data );
		$(".room-"+data['room_id']).remove();
	});

});

function CreateRoom(room_name) {
	var data = {
		user_id		: my_id,
		room_name	: room_name
	}
	socket.emit('create_room',data);
}

function JoinRoom(room_id) {
	var data = {
		room_id: room_id,
		user_id: my_id
	};
	socket.emit('join_room',data);
}