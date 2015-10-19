// MailerService

var request = require('request');

function buildQuery(action,obj) {
  
  var url = sails.config.mailerService.url+'/'+action;
  var json = Utils.extend(obj,{auth:sails.config.mailerService.auth});
  return {url:url,json:json};
}

function postQuery(action,obj,result) {
  
  try {
      
    request.post(buildQuery(action,obj),function(err,response,body){

      if (!err && response.statusCode==200) {

        result(null,body);

      } else if (err) {
        result(err);
      } else result(body);

    });

  } catch(e) {
    result(e.message);
  }
}

module.exports = {
  
  send: function(message,result) {
    
    postQuery('send',{message:message},result);
  },
  
  cancel: function(messageIds,result) {
    
    postQuery('cancel',{messageIds:messageIds},result);
  },
  
  suspend: function(messageIds,result) {
    
    postQuery('suspend',{messageIds:messageIds},result);
  },
  
  resume: function(messageIds,result) {
    
    postQuery('resume',{messageIds:messageIds},result);
  },
  
  accelerate: function(messageIds,result) {
    
    postQuery('accelerate',{messageIds:messageIds},result);
  }
  
}