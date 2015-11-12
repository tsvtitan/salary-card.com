
var includeAll = require('include-all'),
    path = require('path');
    
function Channels(name) {

  this.name = name;
  this.files = {};
  this.sendMessageLimit = 5;
  this.parseMessageLimit = 10;
}

Channels.prototype = {

  setFile: function(name,file) {
    this.files[name] = file;
  }, 
  
  find: function(name) {
    
    var file = Utils.find(this.files,function(f){
      return f.name === name;
    });
    
    return file;
  },
  
  parse: function(message,result) {
    
    var self = this;
    var index = 0;
    
    function make(recipient,ret) {
     
      var locals = {
        title: Utils.format(message.subject,recipient),
        id: message.id,
        created: message.created,
        sender: message.sender,
        recipient: recipient,
        text: (message.text)?Utils.format(message.text,recipient):''
      };
      
      var attachments = Utils.isArray(message.attachments)?Utils.clone(message.attachments):[];
      
      Utils.forEach(attachments,function(attachment){
        
        if (Utils.isDefined(attachment.filename)) {
          attachment.filename = Utils.format(attachment.filename,recipient);
        }
      });
      
      sails.renderView(message.view,locals,function(err,html){
        
        var to = (recipient && recipient.name)?Utils.format('{name} <{contact}>',recipient):Utils.format('{contact}',recipient);
        
        var rnd = Utils.randomString(message.id.toString().length);
                
        var m = {
          from: (message.sender && message.sender.name)?Utils.format('{name} <{contact}>',message.sender):Utils.format('{contact}',message.sender),
          to: to,
          subject: Utils.format(message.subject,recipient),
          html: html,
          headers: Utils.isObject(message.headers)?message.headers:{},
          attachments: attachments,
          messageId: Utils.format('{id}:{contact}:{rnd}',{id:message.id,rnd:rnd,contact:recipient.contact}),
          index: index
        };
        
        m = Utils.extend(m,message.replyTo);
        
        ret(err,m);
      });
    }
    
    if (Utils.isObject(message.recipient)) {
      
      index++;
      make(message.recipient,function(err,m){
        result(m);
      });
      
    } else if (Utils.isArray(message.recipients) && message.recipients.length>0) {
      
      async.mapLimit(message.recipients,self.parseMessageLimit,function(recipient,ret){
      
        index++;
        make(recipient,function(err,m){
          ret(err,m);
        });
        
      },function(err,rets){
        
        var childs = [];
        if (!err) {
          childs = Utils.concat(rets);
        }
        result(childs);
      });
      
    }
  },
  
  send: function(messages,result){
    
    var self = this;
    
    if (!Utils.isEmpty(messages)) {
      
      async.mapLimit(messages,self.sendMessageLimit,function(message,ret){
        
        var file = self.find(message.channel);
        
        if (file && Utils.isFunction(file.send)) {
          
          self.parse(message,function(childs){
            
            if (Utils.isArray(childs)) {
              
              file.send(childs,function(msgs){
                
                var error = [];
                var sentCount = 0;
                
                Utils.forEach(msgs,function(m){
                  
                  if (m.error) error.push(m.error);
                  if (m.sent) sentCount++;
                });
                
                message.sent = new Date();
                message.allCount = msgs.length;
                message.sentCount = sentCount;
                message.errorCount = error.length;
                message.error = Utils.isEmpty(error)?null:error.toString();
                ret(null,message);
              });
              
              /*message.sent = new Date();
              ret(null,message);*/
              
            } else {
              
              file.send(childs,function(msgs){
                
                message.sent = (msgs.sent)?msgs.sent:null;
                message.error = (msgs.error)?msgs.error:null;
                ret(null,message);
              });

            }
          });
          
        } else {
          
          message.error = Utils.format('Channel {channel} was not found.',message);
          ret(null,message);
        }
        
      },function(err,rets){
        
        result(err,messages);
      });
      
    } else result(null,messages);
  }
}

function loadChannels(dir) {

  dir = path.resolve(sails.config.appPath,dir);
  return includeAll({
    dirname: dir,
    filter: /(.+)\.js$/,
    excludeDirs : /(^\.(git|svn)$|^libs+)/,
    optional: true,
    keepDirectoryPath: true,
    flattenDirectories: true
  }) || {};
}

function setOptions(file) {

  if (sails.config.channels) {

    var opts = Utils.path2obj(sails.config.channels,file.name,'/');
    file.disabled = (opts && Utils.isDefined(opts.disabled))?opts.disabled:file.disabled;
  }

  if (Config.channels) {

    var opts = Utils.path2obj(Config.channels,file.name,'/');
    file.disabled = (Utils.isDefined(opts))?!opts:file.disabled;
  }
}

function registerChannels(channels,dir,prefix) {

  var log = channels.log;
  var files = loadChannels(dir);
  if (files) {
    
    for (var i in files) {

      var file = files[i];
      
      if (file) {

        file.name = (file.name)?file.name:i.toString();
        file.name = (prefix)?prefix+file.name:file.name;
        
        setOptions(file);
        
        if (!file.disabled) {
          
          channels.setFile(file.name,file);
          
          log.debug('{name} is loading...',file);
          
          file = Log.extend(file,channels.name.toLowerCase(),file.name,null,true);
        }
      }
    }
  }
}

module.exports = function() {

  var channels = new Channels('Channels');
  channels = Log.extend(channels,null,channels.name);
  
  channels.sendMessageLimit = (sails.config.channels.sendMessageLimit)?sails.config.channels.sendMessageLimit:channels.sendMessageLimit;
  channels.parseMessageLimit = (sails.config.channels.parseMessageLimit)?sails.config.channels.parseMessageLimit:channels.parseMessageLimit;
  
  var need = Config.channels || (!Config.channels && !sails.config.channels.disabled);
  if (need) registerChannels(channels,sails.config.channels.directory);
  
  return channels;
}