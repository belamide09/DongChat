var seq = require('sequelize');

// set connection
var con = new seq('dongchat', 'root', '');

exports.connection = con;

var RoomMember = con.define('room_members', {
	id : {
    type 				: seq.INTEGER,
    primaryKey 	: true
  },
  room_id					: seq.INTEGER,
  user_id					: seq.INTEGER,
  created_datetime: seq.DATE,
  created_ip			: seq.STRING
},
{timestamps : false});

module.exports = RoomMember;