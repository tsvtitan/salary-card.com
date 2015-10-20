// NodemailerChannel

function NodemailerChannel(name,transport,sendLimit) {
  
  this.name = name;
  this.transport = transport;
  this.sendLimit = (sendLimit)?sendLimit:100;
}

NodemailerChannel.prototype = {
  
  send: function(messages,result) {
    
    var self = this;
    var log = self.log;
    
    try {
      
      function sendMessage(message,cb) {
        
        log.debug('begin {messageId} {index}',message);
        
        message.xMailer = self.name;
        message.error = null;
        message.sent = null;
        message.count = 0;

        self.transport.sendMail(message,function(err,info){
          
          message.count++;
          if (err) {
            message.error = err;
          } else {
            message.sent = new Date();
          }
          if (message.count==1) cb();

        });
      }
      
      if (Utils.isArray(messages)) {
        
        async.eachLimit(messages,self.sendLimit,function (message,eachResult){
          
          sendMessage(message,function(){
            eachResult(null);
          });
          
        },function(){
          result(messages);
        });
        
      } else {
        
        sendMessage(messages,function(){
          result(messages);
        });
      }
      
    } catch(e) {
      log.exception(e);
      result(messages);
    }
  }
}

module.exports = function(name,transport,sendLimit) {

  var channel = new NodemailerChannel(name,transport,sendLimit);
  channel = Log.extend(channel,null,null);
  
  return channel;
}