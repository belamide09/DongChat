
// Modules
var express 		= require('express');
var app 				= express();
var mysql       = require("mysql");
var PeerServer 	= require('peer').PeerServer;
var http				= require('http').Server(app);
var io 					= require('socket.io')(http);
var router			= express.Router();
var requestIp   = require('request-ip');
var seq 				= require('sequelize');

var server 			= PeerServer({port: 9000, path: '/', proxied: false});

app.set('views', __dirname + '\\app\\View\\');
app.engine('html', require('ejs').renderFile);

// For node server

app.get("/getOnlineUsers",function(req,res){

  OnlineUser.belongsTo(User,{
		foreignKey: 'id'
	});
	OnlineUser.findAll({
		attributes: [
			'online_users.id'
		],
		include: [User]
	}).done(function(results) {

		res.render('online_users.html',{results:results});

	})

});

http.listen(3000);



// For Peer Server

// Model
var OnlineUser 	= require('./app/Model/OnlineUser.js');
var UsePeer 		= require('./app/Model/UsePeer.js');
var User 				= require('./app/Model/User.js');

server.on('connection', function(id) { 
	console.log( id + ' has connected to the server' );
});
server.on('disconnect', function(id) { 
	removePeer(id);
	console.log( id + ' has disconnected to the server' );
});

var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

var ExpressPeerServer = require('peer').ExpressPeerServer;

app.get('/', function(req, res, next) { res.send('Hello world!'); });


function removePeer(peer_id) {
	// Get peer user
	UsePeer.find({
		where: {
			peer_id: peer_id
		}
	}).done(function(result) {

		var user_id = result['dataValues']['user_id'];
		// Delete peer
		UsePeer.destroy({
		  where: {
		  	peer_id: peer_id
		  }
		}).done(function() {

			// Check if user still online
			UsePeer.find({
				where: {
					user_id: user_id
				}
			}).done(function(result) {
				if ( result == null ) {
					OnlineUser.destroy({
						where: { 
							id: user_id
						}
					});
				}
			})

		})

	});

}