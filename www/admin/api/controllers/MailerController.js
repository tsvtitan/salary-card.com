// MailerController

module.exports = {

  index: function(req,res) {
    
    res.jsonSuccess();
  },
  
  send: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Send error');
    }
    
    try {
      
      async.waterfall([
        
        function getUser(result){
          
          Users.getByRequest(req,result);
        },
        
        function tryCreate(user,result){
          
          if (user && req.body && req.body.message) {
            
            var input = req.body.message;

            var delay = Utils.isNumber(input.delay)?input.delay:300;
            delay = (input.test)?0:delay;
           
            var duration = Utils.isNumber(input.duration)?input.duration:60;

            var begin = moment().add({seconds:delay});
            var end = moment().add({seconds:delay}).add({minutes:duration});
            
            /*var body = null;
            if (input.bodyEncoding) {
              switch (input.bodyEncoding) {
                case 'base64': body = input.body; break;
              }
            } else body = new Buffer(input.body).toString('base64');
            
            if (input.attachments && Utils.isArray(input.attachments)) {
              
              Utils.forEach(input.attachments,function(attachment){
                
                if (attachment.data) {
                  if (!attachment.size) {
                    
                    var buf = new Buffer(attachment.data);
                    attachment.size = buf.length;
                    attachment.data = buf.toString('base64');
                    
                  }
                }
              });
            }*/
            
            var priority = Utils.isNumber(input.priority)?input.priority:999;

            var message = {
              created: new Date(),
              creator: user.login,
              subject: input.subject,
              begin: begin.toDate(),
              end: end.toDate(),
              sender: input.sender,
              recipient: input.recipient,
              recipients: input.recipients,
              headers: input.headers,
              attachments: input.attachments,
              view: input.view,
              channel: input.channel,
              priority: priority
            }
            
            Messages.create(message,function(err,m){

              Messages.notifyCreate(m);
              result(err,m);
            });
            
          } else result(null,null);
        }
        
      ],function(err,message){
        
        if (err) error(err);
        else if (message) {
          res.jsonSuccess({
            id: message.id  
          });
        } else error('Message is not found');
      });
      
    } catch(e) {
      error(e.message);
    }
  }
  
}