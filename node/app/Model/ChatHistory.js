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

module.exports = (function(){
	
	var X = {};

  X.FindUser = function(user_id,callback){
    ChatHistory.find({
      where: {
        $or: [
          {sender_id: user_id},
          {recipient_id: user_id}
        ],
        end: null
      }
    }).done(function(result,err){
      callback(result);
    })
  };

  X.GetChatInfo = function(chat_hash,callback){
    ChatHistory.find({
      where: {
        chat_hash: chat_hash
      }
    }).done(function(result,err){
      callback(result);
    })
  };

  X.UpdateChatEndTime = function(data,callback){
    ChatHistory.update({end: data.datetime},{
      where: {chat_hash: data.chat_hash}
    }).done(function(){
      if(typeof(callback) != 'undefined')callback();
    })
  };

  X.Add = function(data,callback){
    ChatHistory.create({
      chat_hash     : data.chat_hash,
      sender_id     : data.sender_id,
      recipient_id  : data.recipient_id,
      started       : data.datetime,
      end           : null
    }).done(function() {
      callback();
    })
  };

  return X;
})();