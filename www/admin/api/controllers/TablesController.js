
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
      
      async.waterfall([
        
        function getTable(ret) {
          
          if (req.body && req.body.name && req.body.action) {
            
            Tables.findOneByName(req.body.name,function(err,table){
              
              ret(null,table,req.body.action);
            });
            
          } else ret('Body is not found');
        },
        
        function getAccess(table,action,ret) {
          
          if (table) {
            
            Permissions.asOr(req.session.userId,table.name,action,false,
                             function(err,access,user){

              ret(err,access,table.model,action,user);
            });
                    
          } else ret('Table is not found');
        },
        
        function findModel(access,model,action,user,ret) {
          
          if (access) {
            
            var obj = Utils.find(sails.models,function(m){
              return m.globalId === model;
            });

            if (obj) {

              if (Utils.isFunction(obj[action])) {

                ret(null,obj[action],user);

              } else ret('Action is not found');

            } else ret('Model is not found');
            
          } else ret('Access denied');
        },
        
        function parseParams(action,user,ret) {
        
          if (req.body.params) {
            
            try {
              
              var params = JSON.parse(req.body.params);
              ret(null,action,user,params);
              
            } catch (e) {
              ret(e.message);
            }
            
          } else ret(null,action,user,{});
        },
        
        function parseFiles(action,user,params,ret) {
        
          if (req.body.files) {
            
            try {
              
              var files = JSON.parse(req.body.files);
              ret(null,action,user,params,files);
              
            } catch (e) {
              ret(e.message);
            }
            
          } else ret(null,action,user,params,[]);
        },
        
        function uploadFiles(action,user,params,files,ret) {
          
          if (Utils.isArray(files) && !Utils.isEmpty(files)) {
            
            async.map(files,function(name,cb){
              
              req.file(name).upload(function(err1,list){
                cb(err1,list);
              });

            },function(err,results){
              
              if (err) ret(err);
              else {
                var list = [];
                for (var i in results) {
                  list = list.concat(results[i]);
                }
                ret(err,action,user,params,list);
              }
            });
            
          } else ret(null,action,user,params,null);
        },
        
        function executeAction(action,user,params,files,ret) {
          
          action(user,params,files,function(err,result){
            ret(err,files,result);
          });
        },
        
        function deleteFiles(files,result,ret) {
          
          if (!Utils.isEmpty(files)) {
            
            async.each(files,function(f,cb){
              
              if (f && !f.keep && fs.existsSync(f.fd)) {
                
                fs.unlink(f.fd,function(err){
                  cb(err);
                });
                
              } else cb(null);
              
            },function(err){
              if (err) log.error(err);
              ret(null,result);
            });
            
          } else ret(null,result);
        }  

      ],function(err,result){
        if (err) error(err);
        else {
          res.jsonSuccess(result);
        }
      });
      
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
        
        /*async.waterfall([
          
          function getPage(ret){
            
            var where = { name: (req.body)?req.body.name:null };
            var fields = { frames:1,name:1,type:1,class:1,collapsed:1,template:1,
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
                    var fields = {name:1,title:1,description:1,template:1,
                                collapsed:1,canClose:1,canCollapse:1};
                    
                    switch (frame.type) {
                      
                      case 'table': {
                        model = Tables;
                        fields = Utils.extend(fields,{icon:1,columns:1,tree:1});
                        break;
                      }
                      case 'graphs': {
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
                                     function(err,r){
                  cb(err,{name:i.name,record:r,fields:i.fields});
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
        });*/
        
        setTimeout(function(){
          res.jsonSuccess({data:[]});
        },2000);
        

      } else userNotFound();
      
    } catch (e) {
      error(e.message);
    }
  }
  
}

