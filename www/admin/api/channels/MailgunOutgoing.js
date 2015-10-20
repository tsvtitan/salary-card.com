// MailgunOutgoing

var nodemailer = require('nodemailer'),
    mailgun = require('nodemailer-mailgun-transport');    

var transport = nodemailer.createTransport(mailgun({
  
  auth: { 
    api_key: 'key-f5aeb3e716b3fb1dc51a4e9bdf597a61',
    domain: 'sandboxe8d94397545446aebd4fa664f4accf84.mailgun.org'
  }
}));

var NodemailerChannel = require('./libs/NodemailerChannel.js')('MailgunOutgoing',transport,100);

module.exports = {
  
  disabled: true,
  
  send: function(messages,result) {
    
    if (Utils.isArray(messages)) {
      
      Utils.forEach(messages,function(message){
        delete message.attachments;
      });
      
    } else if (Utils.isObject(messages)) {
      delete messages.attachments;
    }  
    
    NodemailerChannel.send(messages,result);
  }
}