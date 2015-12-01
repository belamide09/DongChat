
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

// For node server

io.on('connection',function(socket) {

	socket.on('add_onair_user',function(data) {
		console.log( data );
		OnairUser.count({
			where: {id:data['user_id']}
		}).done(function(count) {
			if ( count == 0 ) {
				OnairUser.create({
					id 								: data['user_id'],
					peer							: data['peer_id'],
					created_datetime	: new Date(),
					created_ip				: getIp(socket)
				}).done(function() {
					io.emit('refresh_rooms');
				})
			} else {
				OnairUser.update({peer: data['peer_id']},{
		      where: { id : data['user_id'] }
		    });
			}
		})

	});

	socket.on('disconnect',function() {
		var user_id = socket.handshake.query['user_id'];
		io.emit('remove_room_member',{user_id:user_id});
		OnairUser.destroy({
			where: {
				id: user_id
			}
		});
		RoomMember.update({ready:0},{
			where: { user_id : user_id }
		});
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
					ready 						: 0,
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

	socket.on('ready',function(data) {
		RoomMember.update({ready:1},{
			where: {
				user_id : data['user_id'],
				room_id	: data['room_id']
			}
		}).done(function() {
			io.emit('change_status_to_ready',data);
		});
	})

	socket.on('start_chat',function(data) {
		io.emit('start_chat',data);
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

	socket.on('save_chat',function(data) {
	})

	socket.on('end_chat',function(data) {
	})

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


http.listen(3000,function() {
	OnairUser.truncate();
});

function getIp(socket) {
  var socketId  = socket.id;
  var clientIp  = socket.request.connection.remoteAddress;
  return clientIp;
}
