// ChartsController

var fs = require('fs');

module.exports = {
  
  index: function(req,res) {
    res.jsonSuccess();
  },
  
  action: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Action error');
    }
    
    if (req.session && req.session.userId) {
      
      var stamp = new Date();
      
      res.jsonSuccess({reload:true},moment().diff(stamp));
      
    } else res.userNotFound();
  },
  
  get: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Get error');
    }
    
    function userNotFound(){
      return error('User is not found');
    }
    
    try {
      
      if (req.session && req.session.userId) {
        
        var stamp = new Date();
        
        if (req.body && req.body.name && req.body.options) {

          switch(req.body.name) {
            
            case 'salary': {
                
              var data = [{
                key: "Cumulative Return",
                values: [
                    { "label" : "A" , "value" : Utils.randomNumber(-29,0) },
                    { "label" : "B" , "value" : Utils.randomNumber(10,60) },
                    //{ "label" : "C" , "value" : 32.807804682612 },
                    { "label" : "C" , "value" : Utils.randomNumber(-32,32) },
                    { "label" : "D" , "value" : Utils.randomNumber(100,196) },
                    { "label" : "E" , "value" : 0.19434030906893 },
                    { "label" : "F" , "value" : -98.079782601442 },
                    { "label" : "G" , "value" : -13.925743130903 },
                    { "label" : "H" , "value" : -5.1387322875705 }
                ]
              }];
            
              //log.debug(data);
            
              res.jsonSuccess({data:data},{value:moment().diff(stamp),max:2000});  
              break;
            }
            default: {
              res.jsonSuccess({data:[]},{value:moment().diff(stamp),max:2000});
            }
          };

        } else ret('Body is not found');
        
      } else userNotFound();
      
    } catch (e) {
      error(e.message);
    }
  }
  
}

