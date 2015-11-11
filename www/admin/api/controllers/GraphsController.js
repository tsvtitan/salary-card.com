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
        
        res.jsonSuccess({data:[]},{value:moment().diff(stamp),max:2000});
        
      } else userNotFound();
      
    } catch (e) {
      error(e.message);
    }
  }
  
}

