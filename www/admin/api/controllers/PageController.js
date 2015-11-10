
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
                        canClose:1,canCollapse:1,locked:1 };

          Users.getModelRecord(req.session.userId,Pages,fields,where,null,null,
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

                if (!item && frame.type && !frame.locked) {
                  
                  var model = null;
                  var fields = {name:1,title:1,description:1,template:1,actions:1,
                              controller:1,collapsed:1,canClose:1,canCollapse:1};

                  switch (frame.type) {

                    case 'table': {
                      model = Tables;
                      fields = Utils.extend(fields,{model:1,icon:1,grid:1,class:1,children:1});
                      fields = Utils.extend(fields,{columnDefs:1,headerName:1,field:1,hide:1,rowSelection:1,enableSorting:1,pinnedColumnCount:1,
                                                    rowHeight:1,enableColResize:1,showToolPanel:1,singleClickEdit:1,suppressScrollLag:1,width:1,
                                                    editable:1,id:1,cellClass:1,first:1,groupHeaders:1,headerGroup:1,format:1,type:1});
                      break;
                    }
                    case 'graph': {
                      model = Graphs;
                      fields = Utils.extend(fields,{icon:1});
                      break;
                    }
                  }

                  if (model) {

                    items.push({
                      name: frame.name,
                      model: model,
                      where: { name: frame.name },
                      fields: fields,
                      type: frame.type
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

              Users.getModelRecord(req.session.userId,i.model,i.fields,i.where,null,{},
                                   function(err,r,user){

                if (!err && r) {
                  
                  switch (i.type) {

                    case 'table': {
                      
                      var model = Utils.find(sails.models,function(m){
                        return m.globalId === r.model;
                      });
                      
                      if (model && r.grid && r.grid.columnDefs) {
                        
                        if (r.children) {
                          r.grid.rowsAlreadyGrouped = true;
                        }
                        
                        Utils.forEach(r.grid.columnDefs,function(col){
                          
                          var attr = model.attributes[col.field];
                          
                          if (Utils.isString(attr)) {
                            col.type = attr;
                          } else if (Utils.isObject(attr) && Utils.isString(attr.type)) {
                            col.type = attr.type;
                          }

                        });
                      }
                      break;
                    }
                  }
                  
                  if (Utils.isArray(r.actions) && r.actions.length>0) {
                    
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

