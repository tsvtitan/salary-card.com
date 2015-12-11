
module.exports = {
  
  index: function(req,res) {

    res.jsonSuccess();
  },

  get: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Frame error');
    }
    
    if (req.session && req.session.userId) {
      
      var stamp = new Date();
      
      async.waterfall([

        function getFrame(ret){
          
          //log.debug(req.body);
          
          if (req.body && Utils.isObject(req.body.frame)) {
            
            ret(null,req.body.frame);
            
          } else ret(null,null);
          
        },

        function prepareFrame(frame,ret){

          if (Utils.isObject(frame)) {
            
            FrameService.prepareFrame(req.session.userId,frame,function(err,frm){
              ret(err,frm);
            });  
            
          } else ret(null,null);
        }

      ],function(err,frame){
        if (err) error(err);
        else {
          res.jsonSuccess({frame:Utils.isObject(frame)?frame:null},{value:moment().diff(stamp),max:2000});
        }
      });

    } else res.userNotFound();
  }
  
}