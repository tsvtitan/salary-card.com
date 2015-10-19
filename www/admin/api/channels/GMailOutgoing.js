// GMailOutgoing

var nodemailer = require('nodemailer'),
    smtpPool = require('nodemailer-smtp-pool'),
    xoauth2 = require('xoauth2');

var generator = xoauth2.createXOAuth2Generator({
  
  user: 'tsv@salary-card.com',
  clientId: '691223571590-un3cqupvva3abineqhsrlc7341mok7i7.apps.googleusercontent.com',
  clientSecret: 'JArX8uZ7pdxjk1d0T9fyimTP',
  refreshToken: '1/shGdn9_E8V5ZPiIkIFRI4Gu8D8pJ29BHJd-3YGNrC58'
});

var options = {
  
  service: 'gmail',
  auth: { xoauth2: generator },
  maxConnections: 3,
  maxMessages: 20,
  rateLimit: 60
};

var transport = nodemailer.createTransport(smtpPool(options));

var NodemailerChannel = require('./libs/NodemailerChannel.js')('GMailOutgoing',transport,options.maxConnections*options.maxMessages);

module.exports = {
  
  disabled: true,
  
  send: function(messages,result) {
    
    NodemailerChannel.send(messages,result);
  }
}