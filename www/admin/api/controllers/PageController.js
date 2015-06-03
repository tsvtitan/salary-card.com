
module.exports = {
  
  index: function(req,res) {

    
    res.jsonSuccess();
  },
  
  frames: function(req,res) {
    
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
        
        var where = {
          id: (req.body)?req.body.id:null
        };

        var fields = {frames:1,type:1,class:1,expanded:1,canClose:1};

        Pages.getByUserOne(req.session.userId,where,fields,
                           function(err,page){
          
          if (err) error(err);
          else {
            var frames = (page && Utils.isArray(page.frames))?page.frames:[];
            //???
            Utils.forEach(frames,function(cols){
              Utils.forEach(cols,function(frame){
                frame.template='tables/default.html';
              });
              
            });
            //???
            res.jsonSuccess({frames:frames});
          }  
        });
        
      } else userNotFound();
      
    } catch (e) {
      error(e.message);
    }
  }
  
}

