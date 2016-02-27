
module.exports = (function(){
	
	var X = {};

  X.EndChat = function(data){
    ChatHistory = data.ChatHistory;
    OnairUser = data.OnairUser;
    ChatHistory.UpdateChatEndTime({
      chat_hash: data.chat_hash,
      datetime: data.datetime
    });
    OnairUser.AppendChatHash({
      chat_hash: null,
      sender_id: data.sender_id,
      recipient_id: data.recipient_id
    });
  }

  X.ReconnectChat = function(data,callback){
    if(data.chat_hash != ''){
      var ChatHistory = data.ChatHistory;
      var OnairUser = data.OnairUser;
      OnairUser.GetChatPartner({
        chat_hash: data.chat_hash,
        user_id: data.user_id
      },function(result){
        if(result)callback(result);
      });
    }
  };

  return X;
})();