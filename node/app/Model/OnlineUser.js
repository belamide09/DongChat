var seq = require('sequelize');

// set connection
var con = new seq('dongchat', 'root', '');

exports.connection = con;

var OnlineUser = con.define('online_users', {
	id : {
    type 				: seq.INTEGER,
    primaryKey 	: true
  },
  created_datetime: seq.DATE,
  created_ip			: seq.STRING
},
{timestamps : false});

module.exports = OnlineUser;