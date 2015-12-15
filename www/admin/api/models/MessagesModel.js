// Messages

module.exports = {
  
  tableName: 'messages',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    created: {
      type: 'datetime',
      required: true,
      index: true,
      defaultsTo: function () { return new Date(); }
    },
    creator: 'string',
    begin: 'datetime',
    end: 'datetime',
    sender: 'json',
    recipient: 'json',
    recipients: 'json',
    parameters: 'json',
    subject: 'string',
    text: 'text',
    headers: 'json',
    keywords: 'json',
    attachments: 'json',
    view: 'string',
    channel: 'string',
    priority: 'integer',
    allCount: 'integer',
    sentCount: 'integer',
    deliveredCount: 'integer',
    errorCount: 'integer',
    error: 'string',
    canceled: 'datetime',
    suspended: 'datetime',
    sent: 'datetime',
    locked: 'datetime',
    
    recipientCount: function() {
      return Utils.isArray(this.recipients)?this.recipients.length:0;
    },
    
    toJSON: function() {
      return Utils.extend({},this);
    }
    
  },
  
  notifyCreate: function(message) {
    
    if (message) {
      //Jobs.start('mailer/Outgoing',null,{id:message.id});
      Events.emit('jobs/mailer/Outgoing',{id:message.id});
    }
  }
  
}