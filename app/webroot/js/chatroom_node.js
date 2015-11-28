var socket = io.connect('http://localhost:3000',{query:"user_id="+my_id});
$(document).ready(function() {

  $(".btn-leave").click(function() {
  	socket.emit('leave_room',{room_id:room_id,user_id:my_id});
  });
	socket.emit('get_chatroom_members',{user_id:my_id,room_id:room_id});

	socket.on('return_chatroom_members',function(data) {
		if ( data['user_id'] == my_id ) {
			var members = data['members'];
			var member_container = '<ul>';

			for( var x in members) {
				var member = members[x]['user'];
				member_container += '<li class="user-'+member['id']+'">';
				member_container += '<span class="btn btn-primary btn-xs btn-call" onclick="Call('+member['id']+')">Call</span>';
				member_container += '<table class="member"><tr>';
				member_container += '<td><div class="member-image"><center><img src="/user_image/'+member['photo']+'"></center></div></td>';
				member_container += '<td><div class="member-name">'+member['firstname']+' '+member['lastname']+'</div></td>';
				member_container += '</tr></table></li>';
			}
			member_container += '</ul>';
			$("#member-list").html(member_container);
		}
	});

	socket.on('append_new_room_member',function(data) {
		if ( data['room_id'] == room_id ) {
			var member = data['member'];
			var member_container = "";
			member_container += '<li class="user-'+member['id']+'">';
			member_container += '<span class="btn btn-primary btn-xs btn-call" onclick="Call('+member['id']+')">Call</span>';
			member_container += '<table class="member"><tr>';
			member_container += '<td><div class="member-image"><center><img src="/user_image/'+member['photo']+'"></center></div></td>';
			member_container += '<td><div class="member-name">'+member['firstname']+' '+member['lastname']+'</div></td>';
			member_container += '</tr></table></li>';
			$("#member-list ul").append(member_container);
		}
	});

	socket.on('remove_room_member',function(data) {
		if ( data['user_id'] == my_id ) {
			location.reload();
		} else {
			if ( data['room_id'] == room_id ) {
				$(".user-"+data['user_id']).remove();
			}
		}
	});

})