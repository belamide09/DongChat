var seq = require('sequelize');

// set connection
var con = new seq('dongchat', 'root', '');

exports.connection = con;

var Room = con.define('rooms', {
	id : {
    type 				: seq.INTEGER,
    autoIncrement: true,
    primaryKey 	: true
  },
  name						: seq.INTEGER,
  host 						: seq.STRING,
  created_datetime: seq.DATE,
  created_ip			: seq.STRING
},
{timestamps : false});

module.exports = Room;