// ExchangeOutgoing

var nodemailer = require('nodemailer'),
    smtpPool = require('nodemailer-smtp-pool');    

var options = {
  
  host: '10.1.3.55',
  port: 25,
  maxConnections: 5,
  maxMessages: 20,
  rateLimit: 100
};

var transport = nodemailer.createTransport(smtpPool(options));

var NodemailerChannel = require('./libs/NodemailerChannel.js')('ExchangeOutgoing',transport,options.maxConnections*options.maxMessages);

module.exports = {
  
  disabled: true,
  
  send: function(messages,result) {
    
    NodemailerChannel.send(messages,result);
  }
}