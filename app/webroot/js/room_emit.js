
var roomEmit = function() {

	var query = {query:"user_id="+my_id+"&room_id="+room_id+"&name="+my_name+"&partner_type="+partner_type};
	var socket = io.connect(location.origin+':4000',query);

	// Add user onair table
	var addOnAir = function(peer_id) {
		socket.emit('add_onair_user',{user_id:my_id,peer_id:id});
	}

	
}