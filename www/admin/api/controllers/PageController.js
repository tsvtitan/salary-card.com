
module.exports = {
  
  index: function(req,res) {

    res.jsonSuccess();
  },

  frames: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Frame error');
    }
    
    if (req.session && req.session.userId) {
      
      var stamp = new Date();
      
      async.waterfall([

        function getPage(ret){

          var where = {name:(req.body)?req.body.name:null};
          var fields = {name:1,type:1,class:1,template:1,event:1,
                      header:1,body:1,footer:1,frames:1,content:1,
                      collapsed:1,canClose:1,canCollapse:1,canLoad:1,locked:1};

          UsersModel.getModelRecord(req.session.userId,PagesModel,fields,where,null,null,
                               function(err,page,user){
            ret(err,page,user);
          });
        },

        function prepareFrames(page,user,ret){

          if (page && Utils.isArray(page.frames)) {
            
            FrameService.prepareFrames(user,page.frames,function(err,frames){
              ret(err,frames);
            });  
            
          } else ret(null,null);
        }

      ],function(err,frames){
        if (err) error(err);
        else {
          res.jsonSuccess({frames:Utils.isArray(frames)?frames:[]},{value:moment().diff(stamp),max:2000});
        }
      });

    } else res.userNotFound();
  },
  
  frame: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Frames error');
    }
    
    if (req.session && req.session.userId) {
      
      var stamp = new Date();
      
      async.waterfall([

        function getPage(ret){

          var where = {name:(req.body)?req.body.name:null};
          var fields = {name:1,type:1,class:1,template:1,header:1,body:1,footer:1,frame:1,content:1,
                      collapsed:1,canClose:1,canCollapse:1,canLoad:1,locked:1};

          UsersModel.getModelRecord(req.session.userId,PagesModel,fields,where,null,null,
                               function(err,page,user){
            ret(err,page,user);
          });
        },

        function prepareFrame(page,user,ret){

          if (page && Utils.isObject(page.frame)) {
            
            FrameService.prepareFrame(user,page.frame,function(err,frame){
              ret(err,frame);
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

