
var fs = require('fs');

module.exports = {
  
  executeRequest: function(req,entityModel,result) {
    
    var log = this.log;
    
    async.waterfall([

      function getEntity(ret) {
        
        //log.debug(req.body);
        
        if (req.body) {
          
          var action = req.body.action;
          
          if (!Utils.isObject(action)) {
            try {
              action = JSON.parse(action);
            } catch (e) {
              ret(e.message);
            }
          }
          
          entityModel.findOneByName(action.entity,function(err,entity){

            ret(err,entity,action);
          });

        } else ret('Body is not found');
      },

      function getAccess(entity,action,ret) {

        if (entity) {

          PermissionsModel.asOr(req.session.userId,entity.name,action.name,false,
                                function(err,access,user){

            ret(err,access,entity,action,user);
          });

        } else ret('Entity is not found');
      },

      function findModel(access,entity,action,user,ret) {

        if (access) {

          var obj = Utils.find(Models,function(m){
            return m.globalId === entity.model;
          });

          if (obj) {

            var name = (action.prefix)?entity.name+action.name:entity.name;
            
            if (Utils.isFunction(obj[name])) {

              ret(null,obj[name],user);

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

        action(user,params,files,function(err,res){
          ret(err,files,res);
        });
      },

      function deleteFiles(files,res,ret) {

        if (!Utils.isEmpty(files)) {

          async.each(files,function(f,cb){

            if (f && !f.keep && fs.existsSync(f.fd)) {

              fs.unlink(f.fd,function(err){
                cb(err);
              });

            } else cb(null);

          },function(err){
            if (err) log.error(err);
            ret(null,res);
          });

        } else ret(null,res);
      }  

    ],function(err,res){
      result(err,res);
    });
  }
  
}