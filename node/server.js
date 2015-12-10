
// Modules
var fs 					= require('fs');
var express 		= require('express');
var app 				= express();
var mysql       = require("mysql");
var options = {
	key: fs.readFileSync('/etc/httpd/ssl/fdc-signal/STAR_inn-devel_com/inn-devel.key'),
  cert: fs.readFileSync('/etc/httpd/ssl/fdc-signal/STAR_inn-devel_com/STAR_inn-devel_com.crt'),
  ca: fs.readFileSync('/etc/httpd/ssl/fdc-signal/STAR_inn-devel_com/STAR_inn-devel_com.cer')
};
var PeerServer 	= require('peer').PeerServer;
var https				= require('https').createServer(options,app);
var io 					= require('socket.io')(https);
var router			= express.Router();
var getIP       = require('ipware')().get_ip;
var dateFormat  = require('dateformat');
var seq 				= require('sequelize');
var md5 				= require('MD5');

var server 			= PeerServer({port: 4500, path: '/', proxied: false, ssl: options});

app.set('views', __dirname + '\\app\\View\\');
app.engine('html', require('ejs').renderFile);

// Model
var OnairUser 	= require('./app/Model/OnairUser.js');
var User 				= require('./app/Model/User.js');
var Room 				= require('./app/Model/Room.js');
var ChatHistory = require('./app/Model/ChatHistory.js');

var room_lists 		= {};
var chathash_arr 	= {};
var messages 			= [];
var room_conversations = [];

// For node server

io.on('connection',function(socket) {

	if ( typeof socket.handshake.query['user_id'] != 'undefined' ) {
		// Reconnect
		io.emit('connect_server',{user_id:socket.handshake.query['user_id']});
	}

	socket.on('add_onair_user',function(data) {
		var user_id = data['user_id'];
		OnairUser.count({
			where: {
				id: user_id
			}
		}).done(function(count) {
			if ( count == 0 ) {
				OnairUser.create({
					id 								: user_id,
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

	socket.on('get_remaining_time_arr',function() {
		ChatHistory.findAll({
			attributes: ['chat_hash','started'],
			where: {
				chat_hash: null
			}
		}).done(function(result) {
			io.emit('return_remaining_time_arr',result);
		});
	})

	socket.on('disconnect',function() {
		var user_id 	= socket.handshake.query['user_id'];
		var chat_hash = chathash_arr[user_id];
		io.emit('reconnect_server',{user_id:user_id});
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
				user_2: null
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

	socket.on('send_room_message',function(data) {
		room_conversations.push(data);
		io.emit('append_room_message',data);
	})


	socket.on('join_room',function(data) {
		Room.update({user_2:data['user_id']},{
			where: {
				id: data['room_id']
			}
		});
		io.emit('remove_room',{room_id:data['room_id']});
		io.emit('append_new_member',{room_id:data['room_id'],user_id:data['user_id'],name:data['name']});
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
					io.emit('notify_disconnect_chat_partner',{chat_hash:chat_hash,user_id:user_id,name:socket.handshake.query['name']});
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

	socket.on('video_chat_room',function(data) {
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
	    io.emit('append_chathash',{sender_id: sender_id, recipient_id: recipient_id,chat_hash: chat_hash});
	    io.emit('start_chattime',{chat_hash:chat_hash});
	    io.emit('notify_new_chat');
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
       chat_hash: chat_hash
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
			io.emit('update_users_status',users);
			io.emit('notify_disconnect_chat',{chat_hash:chat_hash,user_id:user_id,name:socket.handshake.query['name']});
			io.emit('remove_chat',{chat_hash:chat_hash});
    })
	})

	socket.on('kill_chat',function(data) {
		var chat_id 	= data['chat_id'];
		var chat_hash = data['chat_hash'];
		var sender_id = data['sender_id'];
		var recipient_id = data['recipient_id'];
  	delete chathash_arr[sender_id];
  	delete chathash_arr[recipient_id];
		io.emit('end_chat',{chat_hash:chat_hash,kill:1});
		ChatHistory.update({end: new Date()},{
      where: {
       chat_hash: chat_hash,
       end : null
      }
    });
    OnairUser.update({chat_hash: null},{
      where: {
       chat_hash: chat_hash
      }
    });
    var users = [sender_id,recipient_id];
		io.emit('update_users_status',users);
		io.emit('remove_chat',{chat_hash:chat_hash});
	})

	function EndChat(user_id,ended) {
		if ( typeof chathash_arr[user_id] !== 'undefined' ) {
			var chat_hash = chathash_arr[user_id];
    	delete chathash_arr[user_id];
			io.emit('end_chat',{chat_hash:chat_hash});
			ChatHistory.update({end: new Date()},{
	      where: {
	       chat_hash: chat_hash
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
				io.emit('update_users_status',users);
				io.emit('notify_end_chat',{users:users,ended:ended});
				io.emit('remove_chat',{chat_hash:chat_hash});
	    })
		}
	}

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
