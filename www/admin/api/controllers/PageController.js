
module.exports = {
  
  index: function(req,res) {

    
    res.jsonSuccess();
  },
  
  frames: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Frames error');
    }
    
    if (req.session && req.session.userId) {

      async.waterfall([

        function getPage(ret){

          var where = { name: (req.body)?req.body.name:null };
          var fields = { frames:1,name:1,type:1,class:1,collapsed:1,template:1,actions:1,
                        canClose:1,canCollapse:1 };

          Users.getModelRecord(req.session.userId,Pages,where,fields,null,
                               function(err,page){
            ret(err,page);
          });
        },

        function getItems(page,ret){

          if (page && Utils.isArray(page.frames)) {

            var items = [];

            Utils.forEach(page.frames,function(cols){

              Utils.forEach(cols,function(frame){

                var item = Utils.find(items,function(item){
                  return item.name === frame.name;
                });

                if (!item && frame.type) {

                  var model = null;
                  var fields = {name:1,title:1,description:1,template:1,actions:1,
                              collapsed:1,canClose:1,canCollapse:1};

                  switch (frame.type) {

                    case 'table': {
                      model = Tables;
                      fields = Utils.extend(fields,{icon:1,columns:1,tree:1});
                      break;
                    }
                    case 'graph': {
                      model = Graphs;
                      break;
                    }
                  }

                  if (model) {

                    items.push({
                      name: frame.name,
                      model: model,
                      where: { name: frame.name },
                      fields: fields
                    });
                  }  
                }

              });
            });

            ret(null,page.frames,items);

          } else ret(null,null,null);
        },

        function collect(frames,items,ret){

          if (items && items.length>0) {

            async.map(items,function(i,cb){

              Users.getModelRecord(req.session.userId,i.model,i.where,i.fields,{},
                                   function(err,r,user){

                if (!err && r && Utils.isArray(r.actions) && r.actions.length>0) {

                  async.map(r.actions,function(a,cb1){

                    Permissions.asOr(user,i.name,a.name,false,function(err,access){

                      if (a && !access) {
                        a = null;
                      }
                      cb1(err,a);
                    });

                  },function(err1,arr1){
                    r.actions = Utils.filter(arr1,function(a){
                      return (a);
                    });
                    cb(err1,{name:i.name,record:r,fields:i.fields});
                  });

                } else cb(err,{name:i.name,record:r,fields:i.fields});
              });


            },function(err,arr){

              if (err) ret(err);
              else if (arr) {

                var table = [];

                Utils.forEach(frames,function(cols){

                  var records = [];

                  Utils.forEach(cols,function(frame){

                    var obj = Utils.find(arr,function(a){
                      return a.name === frame.name;
                    });

                    if (obj && obj.record) {

                      var rec = Utils.clone(obj.record);
                      rec = Utils.extend(rec,frame);
                      records.push(rec);
                    }

                  });

                  if (records.length>0) {
                    table.push(records);
                  }
                });

                ret(null,table);
              }  
            });

          } else ret(null,null);

        }

      ],function(err,frames){
        if (err) error(err);
        else {
          res.jsonSuccess({frames:Utils.isArray(frames)?frames:[]});
        }
      });

    } else res.userNotFound();
  }
  
}
