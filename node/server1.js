
// Modules
var fs 					= require('fs');
var express 		= require('express');
var app 				= express();
var mysql       = require("mysql");
var PeerServer 	= require('peer').PeerServer;
var https				= require('http').createServer(app);
var io 					= require('socket.io')(https);
var router			= express.Router();
var getIP       = require('ipware')().get_ip;
var dateFormat  = require('dateformat');
var seq 				= require('sequelize');
var md5 				= require('MD5');

var server 			= PeerServer({port: 4500, path: '/', proxied: false});

app.set('views', __dirname + '\\app\\View\\');
app.engine('html', require('ejs').renderFile);

// Model
var OnairUser 	= require('./app/Model/OnairUser.js');
var User 				= require('./app/Model/User.js');
var Room 				= require('./app/Model/Room.js');
var ChatHistory = require('./app/Model/ChatHistory.js');

var room_lists 		= {};
var chathash_arr 	= {};
var chat_time_arr = {};

var chat_duration = 300;

// For node server

io.on('connection',function(socket) {

	if ( typeof socket.handshake.query['user_id'] != 'undefined' ) {
		// Reconnect
		var user_id = socket.handshake.query['user_id'];
		var room_id = socket.handshake.query['room_id'];
		var name 		= socket.handshake.query['name'];
		ChatHistory.find({
			where: {
				$or: [
					{sender_id: user_id},
					{recipient_id: user_id}
				],
				end: null
			}
		}).done(function(result) {	
			var chat_hash = result != null ? result['dataValues']['chat_hash'] : '';
			if ( chat_hash != '' ) {
				var started 							= result['dataValues']['started'];
				var recipient_id 					= result['dataValues']['recipient_id'];
				var sender_id 						= result['dataValues']['sender_id'];
				var partner_id 						= user_id == recipient_id ? sender_id : recipient_id;

				// Get remaining chat time 
				var now 						= new Date() / 1000;
				var start 					= started / 1000;
				var remaining_time 	= (chat_duration - Math.round(now - start,2)) - 1;

				// If still have remaining time reconnect to chat
				if ( remaining_time > 0 ) {
					chathash_arr[user_id] 		= chat_hash;
					chathash_arr[partner_id] 	= chat_hash;
					if ( typeof chat_time_arr[chat_hash] == 'undefined' ) {
						chat_time_arr[chat_hash] 	= remaining_time;
						ChatInterval(chat_hash);
					}
					io.emit('append_chathash',{sender_id: sender_id, recipient_id: recipient_id,chat_hash:chat_hash});
					io.emit('start_chattime',{chat_hash:chat_hash,remaining_time:remaining_time});
				}

			}
			io.emit('connect_server',{user_id:user_id,chat_hash:chat_hash,room_id:room_id,nam:name});
		})
	}

	socket.on('add_onair_user',function(data) {
		var user_id = data['user_id'];
		OnairUser.destroy({
			where: {
				id: user_id
			}

		}).done(function() {
			OnairUser.create({
				id 								: user_id,
				peer							: data['peer_id'],
				chat_hash 				: typeof chathash_arr[user_id] != 'undefined' ? chathash_arr[user_id] : '',
				created_datetime	: new Date(),
				created_ip				: getIp(socket)
			}).done(function() {
				var peer = data['peer_id'];
				var chat_hash = chathash_arr[user_id];
				if ( typeof chat_hash != 'undefined' ) {
					reconnectToChat(user_id,peer,chat_hash);
				}
			})
		})

	});

	function reconnectToChat(user_id,peer,chat_hash) {
		var chat_hash = chathash_arr[user_id];
		ChatHistory.find({
			where: {
				chat_hash: chat_hash
			}
		}).done(function(result) {
			OnairUser.find({
				where: {
					chat_hash: chat_hash,
					id: {
						$ne: user_id
					}
				}
			}).done(function(partner) {
				io.emit('reconnect_chat_partner',{user_id:user_id,partner:partner,peer:peer});
			})
		})
	}

	socket.on('disconnect',function() {
		var user_id 	= socket.handshake.query['user_id'];
		var chat_hash = chathash_arr[user_id];
		OnairUser.destroy({
			where: {
				id: user_id
			}
		}).done(function(result) {
			if ( typeof chat_hash != 'undefined' ) {	
				io.emit('notify_disconnect_chat_partner',{chat_hash:chat_hash,user_id:user_id,name:socket.handshake.query['name']});
			}
		})

		if ( typeof user_id != 'undefined' ) {
			io.emit('remove_room_mate',{partner:user_id});
		}
	})

	function delete_empty_rooms() {
		Room.destroy({
			where: {
				user_1: null,
				user_2: null
			}
		});
		Room.findAll({
			where: {
				$or: [
					{user_1: null},
					{user_2: null}
				]
			}
		}).done(function(result) {
			io.emit('remove_rooms',result);
		});
	}

	socket.on('get_all_rooms',function(data) {
		Room.findAll({
			where: {
				$or: [
					{user_1: null},
					{user_2: null}
				]
			},
		}).done(function(results) {
			io.emit('return_rooms',results);
		});
	});

	socket.on('create_room',function(data) {
		Room.create({
			user_1						: data['user_id'],
			user_id						: null,
			created_datetime	: new Date(),
			created_ip				: getIp(socket)
		}).done(function(result) {
			io.emit('append_new_room',{id:result['dataValues']['id']});
		});
	})

	socket.on('join_room',function(data) {
		Room.find({
			where: {
				id: data['room_id']
			}
		}).done(function(result) {
			if ( result['dataValues']['user_1'] == null ) {
				Room.update({user_1:data['user_id']},{
					where: {
						id: data['room_id']
					}
				});
			} else {
				Room.update({user_2:data['user_id']},{
					where: {
						id: data['room_id']
					}
				});
			}
			io.emit('remove_room',{room_id:data['room_id']});
			io.emit('append_new_member',{room_id:data['room_id'],user_id:data['user_id'],name:data['name']});
		});
	})

	socket.on('leave_room',function(data) {
		if ( typeof socket.handshake.query['user_id'] != 'undefined' ) {
			var partner_type = socket.handshake.query['partner_type'];
			var user_id 	= socket.handshake.query['user_id'];
			var chat_hash = chathash_arr[user_id];
			io.emit('reconnect_server',{user_id:user_id});
			OnairUser.destroy({
				where: {
					id: user_id
				}
			}).done(function(result) {
				if ( typeof chat_hash != 'undefined' ) {	
					io.emit('notify_disconnect_chat_partner',{chat_hash:chat_hash,user_id:user_id});
				}
			})
			if ( partner_type == 'user_1' ) {
				Room.update({user_1:null},{
					where: {
						user_1: user_id
					}
				}).done(delete_empty_rooms);
			} else {
				Room.update({user_2:null},{
					where: {
						user_2: user_id
					}
				}).done(delete_empty_rooms);
			}
		}
	})
	
	socket.on('request_call',function(data) {
		io.emit('request_call',data);
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
	    });
		})
	})

	socket.on('save_chat',function(data) {
		var chat_hash = md5(new Date());
		var sender_id = data['sender_id'];
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
		chat_time_arr[chat_hash] 		= chat_duration -1;
		ChatInterval(chat_hash);
    io.emit('disable_chat_user',{sender_id: sender_id, recipient_id: recipient_id});
    io.emit('append_chathash',{sender_id: sender_id, recipient_id: recipient_id,chat_hash: chat_hash});
    io.emit('start_chattime',{chat_hash:chat_hash,remaining_time:chat_duration});
    io.emit('notify_new_chat');
	})

	function ChatInterval(chat_hash) {
		var interval = setInterval(function() {
			if ( typeof chat_time_arr[chat_hash] == 'undefined' ) {
				clearInterval(interval);
			} else if ( chat_time_arr[chat_hash] > 0 ) {
				chat_time_arr[chat_hash] = chat_time_arr[chat_hash] - 1;
			} else {
				EndChat(chat_hash);
				clearInterval(interval);
			}
		},1000);
	}

	function EndChat(chat_hash) {
		delete chat_time_arr[chat_hash];
		io.emit('end_chat',{chat_hash:chat_hash,remaining_time:chat_duration});
		ChatHistory.update({end: new Date()},{
      where: { chat_hash: chat_hash }
    });
    OnairUser.update({chat_hash: null},{
      where: { chat_hash: chat_hash }
    });
    for(var user_id in chathash_arr) {
    	if ( chathash_arr[user_id] == chat_hash ) {
    		delete chathash_arr[user_id];
    	}
    }
		io.emit('remove_chat',{chat_hash:chat_hash});
    io.emit('end_chat',{chat_hash:chat_hash});
	}

	socket.on('disconnect_chat',function(data) {
		var user_id = socket.handshake.query['user_id'];
		var name 		= socket.handshake.query['name'];
		io.emit('notify_disconnect_chat',{chat_hash:data['chat_hash'],user_id:user_id,name:name});
		EndChat(data['chat_hash']);
	})

	socket.on('toggle_video_disabled',function(data) {
		io.emit('toggle_video_disabled',data);
	})

	socket.on('get_video_stream',function(data) {
		io.emit('get_video_stream',data);
	})

	socket.on('change_video_quality',function(data) {
		io.emit('change_video_quality',data);
	})

	socket.on('kill_chat',function(data) {
		io.emit('notify_kill_chat',{chat_hash:data['chat_hash']});
		io.emit('remove_chat',{chat_hash:data['chat_hash']});
		EndChat(data['chat_hash']);
	})

});

server.on('connection', function(id) { 
	console.log( id + ' has connected to the server' );
});
server.on('disconnect', function(id) {
	console.log( id + ' has disconnected to the server' );
});

app.get('/', function(req, res, next) { res.send('Hello world!'); });

https.listen(4000,function() {
	OnairUser.truncate();
});

function getIp(socket) {
  var socketId  = socket.id;
  var clientIp  = socket.request.connection.remoteAddress;
  return clientIp;
}
