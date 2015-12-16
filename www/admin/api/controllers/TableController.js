
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
      
      ActionService.executeRequest(req,TablesModel,function(err,result){
        
        if (err) error(err);
        else {
          res.jsonSuccess(result,moment().diff(stamp));
        }
      });
      
    } else res.userNotFound();
  },
  
 /*action: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Action error');
    }
    
    if (req.session && req.session.userId) {
      
      var stamp = new Date();
      
      async.waterfall([
        
        function getTable(ret) {
          
          if (req.body) {
            
            if (!Utils.isObject(req.body.action)) {
              
              try {
                req.body.action = JSON.parse(req.body.action);
              } catch (e) {
                ret(e.message);
              }
            }
            
            TablesModel.findOneByName(req.body.action.entity,function(err,table){
              
              ret(err,table,req.body.action.name);
            });
            
          } else ret('Body is not found');
        },
        
        function getAccess(table,action,ret) {
          
          if (table) {
            
            PermissionsModel.asOr(req.session.userId,table.name,action,false,
                                  function(err,access,user){

              ret(err,access,table.model,action,user);
            });
                    
          } else ret('Table is not found');
        },
        
        function findModel(access,model,action,user,ret) {
          
          if (access) {
            
            var obj = Utils.find(Models,function(m){
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
          res.jsonSuccess(result,moment().diff(stamp));
        }
      });
      
    } else res.userNotFound();
  },*/
  
  data: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Data error');
    }
    
    function userNotFound(){
      return error('User is not found');
    }
    
    if (req.session && req.session.userId) {

      var stamp = new Date();

      async.waterfall([

        function getTable(ret) {

          if (req.body && req.body.name && req.body.options) {

            TablesModel.findOneByName(req.body.name,function(err,table){

              ret(err,table,req.body.options);
            });

          } else ret('Body is not found');
        },

        function findModel(table,options,ret) {

          if (table) {

            var obj = Utils.find(Models,function(m){
              return m.globalId === table.model;
            });

            if (obj) {

              ret(null,table,options,obj);

            } else ret('Model is not found');

          } else ret('Table is not found');
        },

        function getData(table,options,model,ret){

          if (table.options) {

            var fields = {};

            var columns = Utils.isArray(table.options.columnDefs)?table.options.columnDefs:[];

            Utils.forEach(columns,function(column){
              fields[column.field] = 1;
            });

            var where = {};

            UsersModel.getModelTable(req.session.userId,model,fields,where,table.sort,{},
                                function(err,data){

              ret(err,data);
            });

          } else ret('Options is not found');
        }

      ],function(err,data){
        if (err) error(err);
        else {
          res.jsonSuccess({data:data},{value:moment().diff(stamp),max:2000});
        }
      });

    } else userNotFound();
  }
  
}

