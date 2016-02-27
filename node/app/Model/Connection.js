
module.exports = (function(){
  
  var X = {};

  X.ReconnectUser = function(data,callback){
    var params = data;
    var now = params.now;
    var ChatHistory = params.ChatHistory;
    ChatHistory.FindUser(params.user_id,function(result){
      if(result != null){
        result = result.dataValues;
        var chat_hash = result != null ? result.chat_hash : '';
        if(chat_hash){
          var sender_id = result.sender_id;
          var recipient_id = result.recipient_id;

          var started =  new Date(result.started).getTime() / 1000;
          var end = started + 250;
          var now = new Date(params.datetime).getTime() / 1000;
          var time  = end - now;
          var data = {
            sender_id: sender_id,
            recipient_id: recipient_id,
            partner_id: params.user_id == recipient_id ? sender_id : result.recipient_id,
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