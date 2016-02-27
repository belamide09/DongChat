var seq = require('sequelize');

// set connection
var con = new seq('dongchat', 'root', '');

exports.connection = con;

var Room = con.define('rooms', {
	id : {
    type 					: seq.INTEGER,
    autoIncrement	: true,
    primaryKey 		: true
  },
  user_1					: seq.INTEGER,
  user_2 					: seq.INTEGER,
  created_datetime: seq.DATE,
  created_ip			: seq.STRING
},
{timestamps : false});

module.exports = (function(){

	var X = {};

	X.GetAllRooms = function(callback){
		Room.findAll({
			where: {
				$or: [
					{user_1: null},
					{user_2: null}
				]
			},
		}).done(function(results) {
			callback(results);
		});
	};

	X.Add = function(data,callback){
		Room.create({
			user_1						: data.user_1,
			user_id						: null,
			created_datetime	: data.datetime,
			created_ip				: data.ip
		}).done(function(result){
			callback(result);
		});
	};

	X.GetRoom = function(room_id,callback){
		Room.find({
			where: {id: room_id}
		}).done(function(result){
			callback(result);
		});
	};

	X.JoinRoom = function(data,callback){
		X.GetRoom(data.room_id,function(result){
			if(result.dataValues.user_1 == null) {
				Room.update({user_1:data.user_id},{
					where: {id: data.room_id}
				}).done(function(result){
					callback(result);
				})
			} else {
				Room.update({user_2:data.user_id},{
					where: {id: data.room_id}
				}).done(function(result){
					callback(result);
				})
			}
		});
	};

	X.LeaveRoom = function(data,callback){
		console.log(data);
		if(data.partner_type == 'user_1'){
			Room.update({user_1:null},{
				where: {user_1: data.user_id}
			}).done(function(){
				callback();
			});
		}else{
			Room.update({user_2:null},{
				where: {user_2: data.user_id}
			}).done(function(){
				callback();
			})
		}
	};

	X.RemoveEmptyRooms = function(){
		Room.destroy({
			where: {
				user_1: null,
				user_2: null
			}
		});
	};

	X.GetEmptyRooms = function(callback){
		Room.findAll({
			where: {
				$or: [
					{user_1: null},
					{user_2: null}
				]
			}
		}).done(function(results){
			callback(results);
		});
	};

	return X;
})();