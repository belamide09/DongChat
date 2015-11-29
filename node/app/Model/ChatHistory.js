var seq = require('sequelize');

// set connection
var con = new seq('dongchat', 'root', '');

exports.connection = con;

var ChatHistory = con.define('chat_history', {
	id : {
    type 				: seq.INTEGER,
    primaryKey 	: true
  },
  chat_hash 			: seq.STRING,
  sender_id				: seq.INTEGER,
  recipient_id		: seq.INTEGER,
  started					: seq.DATE,
  end							: seq.DATE
},
{timestamps : false});

module.exports = ChatHistory;