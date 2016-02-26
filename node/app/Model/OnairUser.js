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
  created_datetime: seq.DATE,
  created_ip			: seq.STRING
},
{timestamps : false});

module.exports = (function(){

	var X = {};

  X.Add = function(data,callback){
    var chathash_arr = data.chathash_arr;
    OnairUser.create({
      id               : data.user_id,
      peer             : data.peer_id,
      chat_hash        : data.chat_hash,
      created_datetime : data.datetime,
      created_ip       : data.ip
    }).done(function() {
      callback();
    });
  };
	 
  X.Remove = function(user_id,callback){
    OnairUser.destroy({
      where: {id: user_id}
    }).done(function(){
      if(typeof(callback) != 'undefined')callback();
    });
  };
   
  X.GetChatPartner = function(data,callback){
  	OnairUser.find({
      where: {
        chat_hash: data.chat_hash,
        id: {
          $ne: data.user_id
        }
      }
    }).done(function(result,err){
      callback(result);
    });
  };

  X.AppendChatHash = function(data,callback){
    OnairUser.update({chat_hash: data.chat_hash},{
      where: {
       id: [data.recipient_id,data.sender_id]
      }
    }).done(function(){
      if(typeof(callback) != 'undefined')callback();
    })
  };

  X.RemoveChatHash = function(chat_hash,callback){
    OnairUser.update({chat_hash: null},{
      where: {chat_hash:chat_hash}
    });
  };

  X.Clear = function(){
    OnairUser.truncate();
  }

	return X;
})();