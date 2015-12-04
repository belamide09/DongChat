var seq = require('sequelize');

// set connection
var con = new seq('dongchat', 'root', '');

exports.connection = con;

var OnairUser = con.define('onair_users', {
	id : {
    type 				: seq.INTEGER,
    primaryKey 	: true
  },
  chat_hash 			: seq.STRING,
  peer 						: seq.STRING,
  on_video_room		: seq.STRING,
  created_datetime: seq.DATE,
  created_ip			: seq.STRING
},
{timestamps : false});

module.exports = OnairUser;