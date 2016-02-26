
// Modules
var fs 					= require('fs');
var express 		= require('express');
var app 				= express();
var mysql       = require("mysql");
var options 		= {
	key: fs.readFileSync('C:/xampp/apache/conf/ssl.key/server.key'),
  cert: fs.readFileSync('C:/xampp/apache/conf/ssl.crt/server.crt'),
  ca: fs.readFileSync('C:/xampp/apache/conf/ssl.csr/server.csr')
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
var Connection 	= require('./app/Model/Connection.js');
var OnairUser 	= require('./app/Model/OnairUser.js');
var User 				= require('./app/Model/User.js');
var Room 				= require('./app/Model/Room.js');
var ChatHistory = require('./app/Model/ChatHistory.js');
var Connection 	= require('./app/Model/Connection.js');
var Chat 				= require('./app/Model/Chat.js');

var room_lists 		= {};
var chathash_arr 	= {};
var chat_time_arr = {};

var chat_duration = 300;

// For node server

io.on('connection',function(socket) {

	if (typeof(socket.handshake.query.user_id) != 'undefined') {
		// Reconnect
		var user_id = socket.handshake.query.user_id;
		var room_id = socket.handshake.query.room_id;
		var name 		= socket.handshake.query.name;

		var params = {
			ChatHistory: ChatHistory,
			chat_duration: chat_duration,
			chathash_arr: chathash_arr,
			chat_time_arr: chat_time_arr,
			ChatHistory: ChatHistory,
			user_id: user_id
		};

		Connection.ReconnectUser(params,function(result){
			// Can reconnect
			if(result && result.time > 0){
				var chat_hash = result.chat_hash;
				chathash_arr[user_id] 	= chat_hash;
				chathash_arr[partner_id]= chat_hash;

				if(typeof chat_time_arr[chat_hash] == 'undefined' ) {
					chat_time_arr[chat_hash] 	= result.time;
					ChatInterval(chat_hash);
				}
				io.emit('append_chathash',{
					sender_id: result.dataValues.sender_id,
					recipient_id: result.dataValues.recipient_id,
					chat_hash: chat_hash
				});
				io.emit('start_chattime',{
					chat_hash:chat_hash,
					remaining_time:time
				});
			}else{
				io.emit('connect_server',{
					user_id: user_id,
					chat_hash: chat_hash,
					room_id: room_id,
					name: name
				});
			}
		});
	}

	socket.on('add_onair_user',function(data){;
		var user_id = data.user_id;
		var chat_hash = typeof chathash_arr[user_id] != 'undefined' ? chathash_arr[user_id] : '';
		OnairUser.Remove(user_id,function(){
			OnairUser.Add({
				user_id 	: user_id,
				peer_id		: data.peer_id,
				chat_hash : chat_hash,
				datetime 	: new Date(),
				ip				: getIp(socket)
			},function(){
				var peer = data.peer_id;
				var params = {
					ChatHistory: ChatHistory,
					OnairUser: OnairUser,
					user_id: user_id,
					chat_hash: chat_hash
				};
				Chat.ReconnectChat(params,function(result){
					var data = {
						user_id: user_id,
						partner: result,
						peer: peer
					};
					io.emit('reconnect_chat_partner',data);
				});
			})
		})
	});

	socket.on('disconnect',function() {
		var user_id 	= socket.handshake.query.user_id;
		var chat_hash = chathash_arr[user_id];
		OnairUser.Remove(user_id,function() {
			if(typeof(chat_hash) != 'undefined'){	
				io.emit('notify_disconnect_chat_partner',{
					chat_hash: chat_hash,
					user_id: user_id,
					name: socket.handshake.query.name
				});
			}
		})
	});

	socket.on('get_all_rooms',function(data) {
		Room.GetAllRooms(function(results) {
			io.emit('return_rooms',results);
		});
	});

	socket.on('create_room',function(data) {
		Room.Add({
			user_1		: data.user_id,
			user_id		: null,
			datetime	: new Date(),
			ip				: getIp(socket)
		},function(result) {
			io.emit('append_new_room',{id:result.dataValues.id});
		});
	})

	socket.on('join_room',function(data) {
		Room.JoinRoom(data,function(result) {
			io.emit('remove_room',{room_id:data.room_id});
			io.emit('append_new_member',{
				room_id: data.room_id,
				user_id: data.user_id,
				name: data.name
			});
		});
	})

	socket.on('leave_room',function(data) {
		if(typeof socket.handshake.query.user_id != 'undefined') {
			// var partner_type = socket.handshake.query.partner_type;
			// var user_id 	= socket.handshake.query.user_id;
			// var chat_hash = chathash_arr[user_id];
			// io.emit('reconnect_server',{user_id:user_id});
			// OnairUser.Remove({
			// 	user_id: user_id,
			// 	partner_type: partner_type
			// },function(result){
			// 	io.emit('notify_disconnect_chat_partner',{
			// 		chat_hash: chat_hash,
			// 		user_id: user_id
			// 	});
			// })
			// Room.LeaveRoom(data,function(){
			// 	Room.RemoveEmptyRooms();
			// 	Room.GetEmptyRooms(function(results) {
			// 		io.emit('remove_rooms',results);
			// 	});
			// });
		}
	})
	
	socket.on('request_call',function(data) {
		io.emit('request_call',data);
	})

	socket.on('generate_chat_hash',function(data) {
		var chat_hash = md5(new Date());
		ChatHistory.Add({
			chat_hash    : chat_hash,
      sender_id    : data.sender_id,
      recipient_id : data.recipient_id,
      datetime     : data.datetime,
      end          : null
		},function(){
			OnairUser.AppendChatHash({
				chat_hash 	: chat_hash,
				sender_id		: sender_id,
				recipient_id: recipient_id
			});
		})
	})

	socket.on('save_chat',function(data) {
		var chat_hash = md5(new Date());
		ChatHistory.Add({
			chat_hash    : chat_hash,
      sender_id    : data.sender_id,
      recipient_id : data.recipient_id,
      datetime     : data.datetime,
      end          : null
		},function(){
			OnairUser.AppendChatHash({
				chat_hash 	: chat_hash,
				sender_id		: data.sender_id,
				recipient_id: data.recipient_id
			});
		})
		chathash_arr[data.recipient_id] = chat_hash;
		chathash_arr[data.sender_id]= chat_hash;
		chat_time_arr[chat_hash] = chat_duration-1;
		ChatInterval(chat_hash);
    io.emit('disable_chat_user',{
    	sender_id: data.sender_id,
    	recipient_id: data.recipient_id
    });
    io.emit('append_chathash',{
    	sender_id: data.sender_id,
    	recipient_id: data.recipient_id,
    	chat_hash: chat_hash
    });
    io.emit('start_chattime',{
    	chat_hash: chat_hash, remaining_time: chat_duration
    });
    io.emit('notify_new_chat');
	})

	function ChatInterval(chat_hash) {
		var interval = setInterval(function() {
			if(typeof(chat_time_arr[chat_hash]) == 'undefined'){
				clearInterval(interval);
			}else if(chat_time_arr[chat_hash] > 0) {
				chat_time_arr[chat_hash] = chat_time_arr[chat_hash]-1;
			}else{
				EndChat(chat_hash);
				clearInterval(interval);
			}
		},1000);
	}

	function EndChat(chat_hash) {;
    io.emit('end_chat',{chat_hash:chat_hash});
    io.emit('end_chat',{
    	chat_hash: chat_hash,
    	remaining_time: chat_duration
    });
		ChatHistory.UpdateChatEndTime({
			datetime: new Date(),
			chat_hash: chat_hash
    });
    OnairUser.RemoveChatHash(chat_hash);
    for(var user_id in chathash_arr) {
    	if ( chathash_arr[user_id] == chat_hash ) {
    		delete chathash_arr[user_id];
    	}
    }
	}

	socket.on('disconnect_chat',function(data) {
		var user_id = socket.handshake.query.user_id;
		var name 		= socket.handshake.query.name;
		io.emit('notify_disconnect_chat',{
			chat_hash: data.chat_hash,
			user_id: user_id,
			name: name
		});
		EndChat(data['chat_hash']);
	})

	socket.on('toggle_video',function(data) {
		io.emit('toggle_video',data);
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
	OnairUser.Clear();
});

function getIp(socket) {
  var socketId  = socket.id;
  var clientIp  = socket.request.connection.remoteAddress;
  return clientIp;
}
