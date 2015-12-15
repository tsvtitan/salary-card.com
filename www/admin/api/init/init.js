
var util = require('util'),
    moment = require('moment'),
    
    Utils = require('./modules/utils.js'),
    Log = require('./modules/log.js'),
    Events = require('./modules/events.js'),
    Jobs = require('./modules/jobs.js'),
    Channels = require('./modules/channels.js');
    

function extendModel(utils,model) {
  
  var log = model.log;
  
  model.change = function(user,params,files,result) {
    
    var keys = model.changeKeys;
    
    log.debug(params);
    
    if (utils.isArray(keys) && params) {
      
      var where = {};
      
      utils.forEach(keys,function(k){
        
        if (utils.isDefined(params[k])) {
          where[k] = params[k];
        }
      });
      
      log.debug(where);
      
      if (!utils.isEmpty(where)) {
        
        model.update(where,params,function(err,updated){

          if (err) result(err)
          else if (updated) result(null,{reload:false})
          else result('Record is not found');

        });
        
      } else result('Where is empty');
            
    } else result('Change keys are not found');
  }
  
  return model;
}

module.exports = function() {

  global['util'] = util;
  global['moment'] = moment;
  
  global['Config'] = config = (process.env.CONFIG)?JSON.parse(process.env.CONFIG):{};
  global['Utils'] = utils = Utils();
  global['Log'] = log = Log();
  
  log.debug('Bootstraping...');
  log.debug('Config: %s',[config]);

  global['Events'] = events = Events();
  
  utils.forEach(sails.services,function(service){
    service = log.extend(service,'services',service.globalId,null,true);
  });
  global['Services'] = sails.services;

  utils.forEach(sails.models,function(model){
    model = log.extend(model,'models',model.globalId,null,true);
    model = extendModel(utils,model);
  });
  global['Models'] = sails.models;

  utils.forEach(sails.controllers,function(controller){
    controller = log.extend(controller,'controllers',controller.globalId+'Controller',null,true);
  });
  global['Controllers'] = sails.controllers;
  
  global['Jobs'] = jobs = Jobs();
  global['Channels'] = channels = Channels();
  
  function processStop() {
    events.end();
    jobs.stop(function() {
      process.exit(0);
    });
  }
  
  process.on('SIGTERM',processStop);
  process.on('SIGINT',processStop);

}