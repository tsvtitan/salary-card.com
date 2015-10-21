// GraphsController

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
      
      res.jsonSuccess({reload:true});
      
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
        
        setTimeout(function(){
          res.jsonSuccess({data:[]});
        },2000);

      } else userNotFound();
      
    } catch (e) {
      error(e.message);
    }
  }
  
}

