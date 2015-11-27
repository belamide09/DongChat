var seq = require('sequelize');

// set connection
var con = new seq('dongchat', 'root', '');

exports.connection = con;

var UsePeer = con.define('use_peers', {
	id : {
    type 				: seq.INTEGER,
    primaryKey 	: true
  },
  user_id					: seq.INTEGER,
  peer_id 				: seq.STRING,
  created_datetime: seq.DATE,
  created_ip			: seq.STRING
},
{timestamps : false});

module.exports = UsePeer;