
module.exports = (function(){
	
	var X = {};

  X.ReconnectUser = function(data,callback){
    var ChatHistory = data.ChatHistory;
    ChatHistory.FindUser(data.user_id,function(result){
      if(result != null){
        console.log(data);
        return false;
        result = result.dataValues;
        var chat_hash = result != null ? result.chat_hash : '';
        if(chat_hash){
          var sender_id = result.sender_id;
          var recipient_id = result.recipient_id;

          var started = result.started;
          var now = new Date() / 1000;
          var time  = (data.chat_duration - Math.round(now - start,2)) - 1;
          var data = {
            sender_id: sender_id,
            recipient_id: recipient_id,
            partner_id: data.user_id == recipient_id ? sender_id : result.recipient_id,
            started: result.started,
            time: time
          };
          callback(data);
        }
      }else{
        callback(false);
      }
    });
  };

  return X;
})();