
module.exports = {
  
  index: function(req,res) {

    res.jsonSuccess();
  },
  
  get: function(req,res) {
    
    res.jsonSuccess({},1000);
  },
  
  action: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Action error');
    }
    
    if (req.session && req.session.userId) {
      
      var stamp = new Date();
      
      ActionService.executeRequest(req,FormsModel,function(err,result){
        
        if (err) error(err);
        else {
          res.jsonSuccess(result,moment().diff(stamp));
        }
      });
      
    } else res.userNotFound();
  },
  
}