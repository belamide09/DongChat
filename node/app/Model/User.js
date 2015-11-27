var seq = require('sequelize');

// set connection
var con = new seq('dongchat', 'root', '');

exports.connection = con;

var User = con.define('users', {
	id : {
    type 				: seq.INTEGER,
    primaryKey 	: true
  },
  firstname : seq.STRING,
  lastname	: seq.STRING,
  photo			: seq.STRING,
  gender 		: seq.STRING,
  country 	: seq.STRING
},
{timestamps : false});

module.exports = User;