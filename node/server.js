
// Modules
var express 		= require('express');
var app 				= express();
var mysql       = require("mysql");
var PeerServer 	= require('peer').PeerServer;
var http				= require('http').Server(app);
var io 					= require('socket.io')(http);
var router			= express.Router();
var getIP       = require('ipware')().get_ip;
var dateFormat  = require('dateformat');
var seq 				= require('sequelize');
var md5 				= require('MD5');

var server 			= PeerServer({port: 9000, path: '/', proxied: false});

app.set('views', __dirname + '\\app\\View\\');
app.engine('html', require('ejs').renderFile);

// Model
var OnairUser 	= require('./app/Model/OnairUser.js');
var User 				= require('./app/Model/User.js');
var Room 				= require('./app/Model/Room.js');
var RoomMember 	= require('./app/Model/RoomMember.js');
var ChatHistory = require('./app/Model/ChatHistory.js');

var room_lists 		= {};
var chathash_arr 	= {};
var messages 			= [];
var room_conversations = [];

// For node server

io.on('connection',function(socket) {

	socket.on('add_onair_user',function(data) {
		var user_id = data['user_id'];
		OnairUser.count({
			where: {id:data['user_id']}
		}).done(function(count) {
			if ( count == 0 ) {
				OnairUser.create({
					id 								: user_id,
					on_video_room			: data['video_chat'],
					peer							: data['peer_id'],
					chat_hash 				: typeof chathash_arr[user_id] != 'undefined' ? chathash_arr[user_id] : '',
					created_datetime	: new Date(),
					created_ip				: getIp(socket)
				}).done(function() {

					User.belongsTo(OnairUser,{
						foreignKey: 'id'
					});
					User.find({
						where: {id: user_id},
						include: [OnairUser]
					}).done(function (member) {
						io.emit('append_new_room_member',{room_id:data['room_id'],member:member});
						if ( typeof chathash_arr[user_id] != 'undefined' ) {
							var chat_hash = chathash_arr[user_id];
							io.emit('append_chathash',{sender_id: user_id, recipient_id: user_id,chat_hash:chat_hash});
							OnairUser.find({
								where: {
									chat_hash: chat_hash,
									id: { $ne: user_id }
								}
							}).done(function(user) {
								io.emit('reconnect_chat',{user_id:user_id,partner:user});
								io.emit('notify_reconnect',{partner:user_id,name:socket.handshake.query['name']});
							})
							ChatHistory.find({
								where: {
									chat_hash: chat_hash
								}
							}).done(function(result) {
								var now = new Date() / 1000;
								var start = result['dataValues']['started'] / 1000;
								var remaining_time = (300 - Math.round(now - start,2));
								io.emit('return_remaining_time',{user_id:user_id,remaining_time:remaining_time});
							})
						}
					})

				})
			}
		})

	});

	socket.on('disconnect',function() {
		var user_id 	= socket.handshake.query['user_id'];
		var chat_hash = chathash_arr[user_id];
		io.emit('remove_room_member',{user_id:user_id});
		OnairUser.destroy({
			where: {
				id: user_id
			}
		}).done(function(result) {
			io.emit('notify_disconnect_chat_partner',{chat_hash:chat_hash,user_id:user_id,name:socket.handshake.query['name']});
		})
	})

	socket.on('get_all_rooms',function(data) {

		Room.findAll().done(function(results) {
			io.emit('return_rooms',{user_id:data['user_id'],results:results});
		});

	});

	socket.on('create_room',function(data) {
		RoomMember.count({
			where: {user_id: data['user_id']}
		}).done(function(count) {
			if ( count == 0 ) {
				Room.create({
					name 							: data['room_name'],
					host							: data['user_id'],
					members						: 1,
					created_datetime	: new Date(),
					created_ip				: getIp(socket)
				}).done(function(result) {
					RoomMember.create({
						room_id : result['dataValues']['id'],
						user_id : data['user_id'],
						created_datetime	: new Date(),
						created_ip				: getIp(socket)
					});
					io.emit('append_new_room',result);
				})
			}
		});
	})

	socket.on('get_messages',function(data) {
		io.emit('return_messages',{messages:messages,user_id:data['user_id']})
	});

	socket.on('get_room_messages',function(data) {

		var messages = GetRoomMessages(data['room_id']);
		io.emit('return_room_messages',{messages:room_conversations,user_id:data['user_id']})

	});


	socket.on('send_message',function(data) {

		messages.push(data);
		if ( messages.length == 100 ) {
			messages = messages.slice(1);
		}
		io.emit('append_message',data);

	})

	socket.on('send_room_message',function(data) {

		room_conversations.push(data);
		io.emit('append_room_message',data);

	})


	socket.on('join_room',function(data) {
		
		RoomMember.count({
			where: {
				room_id: data['room_id'],
				user_id: data['user_id']
			}
		}).done(function(count) {
			if ( count == 0 ) {
				RoomMember.create({
					room_id						: data['room_id'],
					user_id						: data['user_id'],
					created_datetime	: new Date(),
					created_ip				: getIp(socket)
				}).done(function() {
					User.belongsTo(OnairUser,{
						foreignKey: 'id'
					});
					User.find({
						where: {id: data['user_id']},
						include: [OnairUser]
					}).done(function (member) {
						io.emit('append_new_room_member',{room_id:data['room_id'],member:member});
						io.emit('redirect_user_to_room',data);
					})
				});

			}
		})

	})

	socket.on('get_chatroom_members',function(data) {
		RoomMember.belongsTo(User,{
			foreignKey: 'user_id'
		});
		RoomMember.belongsTo(OnairUser,{
			foreignKey: 'user_id'
		});
		RoomMember.findAll({
			where: {
				user_id: { 
					$ne: data['user_id'],
				},
				room_id: data['room_id']
			},
			include: [User,OnairUser]
		}).done(function(members) {
			io.emit('return_chatroom_members',{user_id:data['user_id'],members:members});
		});

	})

	socket.on('leave_room',function(data) {

		RoomMember.destroy({
			where: {
				user_id: data['user_id'],
				room_id: data['room_id']
			}
		}).done(function() {
			RoomMember.count({
				where: {
					room_id: data['room_id']
				}
			}).done(function(count) {
				if ( count == 0 ) {
					Room.destroy({where: {id:data['room_id']}});
				}
				io.emit('remove_room_member',{user_id:data['user_id']});
				io.emit('remove_room',data);
			})
		})

	})

	socket.on('video_chat_room',function(data) {

		console.log('data');
		OnairUser.destroy({
			where: {
				id: data['user_id']
			}
		}).done(function() {
			io.emit('redirect_to_chat',data);
		})

	})
	
	socket.on('request_call',function(data) {

		io.emit('request_call',data);

	})

	socket.on('go_back_to_room',function(data) {

		OnairUser.destroy({
			where: {
				id: data['user_id']
			}
		}).done(function(result) {
			io.emit('go_back_to_room',data);
		})

	})

	socket.on('generate_chat_hash',function(data) {

		var chat_hash = md5(new Date());
		var sender_id = data['sender_id'];
		var recipient_id = data['recipient_id'];
		ChatHistory.create({
			chat_hash			: chat_hash,
			sender_id			: sender_id,
			recipient_id	: recipient_id,
			started 			: new Date(),
			end						: null
		}).done(function() {
			OnairUser.update({chat_hash: chat_hash},{
	      where: {
	       id: [recipient_id,sender_id]
	      }
	    }).done(function() {
	    	io.emit('disable_chat_user',{sender_id: sender_id, recipient_id: recipient_id});
	    	io.emit('redirect_to_chat',{chat_hash:chat_hash});
	    })
		})

	})

	socket.on('save_chat',function(data) {
		OnairUser.find({
			where: {
				peer: data['sender_peer']
			}
		}).done(function(result) {
			var chat_hash = md5(new Date());
			var sender_id = result['dataValues']['id'];
			var recipient_id = data['recipient_id'];
			ChatHistory.create({
				chat_hash			: chat_hash,
				sender_id			: sender_id,
				recipient_id	: recipient_id,
				started 			: new Date(),
				end						: null
			});
			OnairUser.update({chat_hash: chat_hash},{
	      where: {
	       id: [recipient_id,sender_id]
	      }
	    });
			chathash_arr[recipient_id] 	= chat_hash;
			chathash_arr[sender_id] 		= chat_hash;
	    io.emit('disable_chat_user',{sender_id: sender_id, recipient_id: recipient_id});
	    io.emit('append_chathash',{sender_id: sender_id, recipient_id: recipient_id,chat_hash});
	    io.emit('start_chattime',{chat_hash:chat_hash});
		})
	})

	socket.on('end_chat',function(data) {
		var user_id = data['user_id'];
		EndChat(user_id,true);
	})

	socket.on('disconnect_chat',function(data) {
		var user_id = data['user_id'];
		var chat_hash = chathash_arr[user_id];
		delete chathash_arr[user_id];
		ChatHistory.update({end: new Date()},{
      where: {
       chat_hash: chat_hash,
       end			: null
      }
    });
    OnairUser.find({
    	attributes: ['id'],
    	where: {
    		chat_hash: chat_hash,
    		id: {
    			$ne: user_id
    		}
    	}
    }).done(function(user) {
	    var users = [user_id];
	    OnairUser.update({chat_hash: null},{
	      where: {
	       chat_hash: chat_hash
	      }
	    });
	   	if ( user != null ) {
	    	var partner_id = user['dataValues']['id'];
	    	users.push(partner_id);
	    	delete chathash_arr[partner_id];
	    }
			io.emit('update_users_status',{users});
			io.emit('notify_disconnect_chat',{chat_hash:chat_hash,user_id:user_id,name:socket.handshake.query['name']});
    })
	})

	function EndChat(user_id,ended) {
		if ( typeof chathash_arr[user_id] !== 'undefined' ) {
			var chat_hash = chathash_arr[user_id];
    	delete chathash_arr[user_id];
			io.emit('end_chat',{chat_hash:chat_hash});
			ChatHistory.update({end: new Date()},{
	      where: {
	       chat_hash: chat_hash,
	       end			: null
	      }
	    });
	    OnairUser.update({chat_hash: null},{
	      where: {
	       chat_hash: chat_hash
	      }
	    });
	    OnairUser.findAll({
	    	attributes: ['id'],
	    	where: {
	    		chat_hash: chat_hash
	    	}
	    }).done(function(users) {
				io.emit('update_users_status',users);
				io.emit('notify_end_chat',{users:users,ended:ended});
	    })
		}
	}

	function GetRoomMessages(room_id) {
		var messages = [];
		for(var x in room_conversations) {
			if ( room_conversations[x]['room_id'] == room_id) {
				messages.push(room_conversations[x]);
			}
		}
		return messages;
	}

});

server.on('connection', function(id) { 
	console.log( id + ' has connected to the server' );
});
server.on('disconnect', function(id) {
	console.log( id + ' has disconnected to the server' );
});

var ExpressPeerServer = require('peer').ExpressPeerServer;

var ExpressPeerServer = require('peer').ExpressPeerServer;

app.get('/', function(req, res, next) { res.send('Hello world!'); });


http.listen(3000);

function getIp(socket) {
  var socketId  = socket.id;
  var clientIp  = socket.request.connection.remoteAddress;
  return clientIp;
}
