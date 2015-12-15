// Users

var bcrypt = require('bcrypt');    

module.exports = {
  
  tableName: 'users',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {

    created: {
      type: 'datetime',
      required: true,
      defaultsTo: function () { return new Date(); }
    },
    login: {
      type: 'string',
      unique: true,
      required: true
    },
    email: {
      type: 'email'
    },
    pass: {
      type: 'string'
    },
    access: {
      type: 'json'
    },
    page: 'string',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  setPassHash: function(user,result) {
    
    var log = UsersModel.log;
    
    if (user.pass) {
      bcrypt.genSalt(10, function(err,salt) {
        bcrypt.hash(user.pass,salt,function(err,hash) {
          if(err) {
            log.error(err);
            result(err);
          } else {
            user.pass = hash;
            result(null,user);
          }
        });
      });
    } else result(null,user);
  },
  
  beforeCreate: function(user,result) {
    
    this.setPassHash(user,result);
  },
  
  beforeUpdate: function(user,result) {
    
    this.setPassHash(user,result);
  },
  
  isGranted: function (userOrId,url,params,result) {

    function granted(user) {

      function exists(props) {

        function check(v1,v2) {

          var r = false;
          if (Utils.isString(v2)) {

            r = v1==='*';
            if (!r) {
              r = v2.search(v1)!==-1;
            }

          } else if (Utils.isObject(v2)) {

            for (var k in v2) {

              var v = v2[k];
              if (Utils.isString(v)) {

                r = v1==='*';
                if (!r) {
                  r = v.search(v1)!==-1;
                }
                if (r) break;
              }
            }
          }
          return r;
        }

        var ret = true;
        for (var prop in props) {

          var v1 = props[prop];
          var v2 = params[prop];

          if (v2) {

            if (Utils.isString(v1)) {

              ret = ret && check(v1,v2);

            } else if (Utils.isObject(v1)) {

              var r = true;
              for (var k in v1) {

                var v = v1[k];
                if (Utils.isString(v)) {
                  r = check(v,v2);
                  if (r) break;
                } 
              }
              ret = ret && r;
            }
          }
        }
        return ret;
      } 

      if (user) {

        if (user.access) {

          if (Utils.isObject(user.access) && url) {

            for (var prop in user.access) {

              if (url.search(prop)!==-1) {
                var p = user.access[prop];
                if (Utils.isString(p)) {
                  return p==='*';
                } else if (Utils.isObject(p)) {
                  return exists(p);
                }
              }
            }
          } else return (Utils.isObject(user.access) && user.access==='*');

        } else return false;
      }
      return false;
    }
    
    if (Utils.isObject(userOrId)) {
      
      result(null,granted(userOrId));
      
    } else {
      
      this.findOneById(userOrId,function(err,user){
        result(err,granted(user));
      });
    }
  },
  
  getModelTable: function (userOrId,model,fields,where,sort,def,result) {
    
    var log = this.log;
    var self = this;
    
    if (userOrId && Utils.isObject(model)) {

      async.waterfall([
        
        function getAccess(ret) {
          
          PermissionsModel.asWhere(userOrId,model.tableName,'view',def,function(err,access,user){
            
            ret(err,access,user);
          });
        },
        
        function getTable(access,user,ret) {
          
          if (user) {
            
            if (access) {
              
              var w = {
                locked: [null,undefined,false],
                lang: (user.lang)?user.lang:null
              };
              
              w = Utils.extend(w,where);
              w = Utils.extend(w,access);
              
              var s = {priority:1};
              if (Utils.isObject(sort)) {
                s = sort;
              }
              
              model.find({where:w,sort:s},{fields:fields},
                         function(err,table){

                ret(err,table,user);          
              });
              
            } else ret(null,[],user);  
            
          } else ret(null,[],user);
        }
        
      ],function(err,table,user){
        result(err,Utils.remainKeys(table,fields),user);
      });
      
    } else result(null,[],null);
  },
  
  getModelRecord: function (userOrId,model,fields,where,sort,def,result) {
    
    this.getModelTable(userOrId,model,fields,where,sort,def,
                       function(err,table,user){
      
      var record = null;
      if (Utils.isArray(table) && table.length>0) {
        record = table[0];
      }
      result(err,record,user);
    });
  },
  
  getEnvironment: function (userOrId,result) {
    
    var self = this;
    
    if (userOrId) {
      
      async.waterfall([
        
        function findUser(ret){
          
          if (Utils.isObject(userOrId)) {
            
            ret(null,userOrId);
            
          } else {
            
            self.findOneById(userOrId,function(err,user){
              ret(err,user);
            });
          }
        },
        
        function collect(user,ret){
         
          if (user) {
            
            var items = [];

            items.push({
              name: 'pages',
              model: PagesModel,
              where: {},
              fields: {name:1,title:1,description:1,url:1,template:1,breadcrumbs:1}
            });
            
            items.push({
              name: 'menu',
              model: MenuModel,
              where: {},
              fields: {title:1,description:1,page:1,items:1,class:1}
            });

            async.map(items,function(i,cb){

              self.getModelTable(user,i.model,i.fields,i.where,null,null,function(err,r){
                cb(err,{name:i.name,obj:r});
              });

            },function(err,arr){

              if (err) ret(err,user);
              else if (arr) {

                var env = {};

                Utils.forEach(arr,function(a){
                  env[a.name] = a.obj;
                });

                ret(null,user,env);

              } else ret(null,user);

            });
            
          } else ret(null,user);
        }
        
        
      ],function(err,user,env){
        result(err,user,env);
      });
      
    } else result();
    
  },
  
  getByLogin: function(login,pass,lockOnFail,needEnv,result) {

    var self = this;
    var log = this.log;
    
    if (login) {
      
      log.debug('Trying to find the user (%s) in the local db...',[login]);
      
      async.waterfall([
        
        function findUser(ret) {
          
          self.findOneByLogin(login,function(err,user){
            ret(err,user);
          });
        },
        
        function checkCredentials(user,ret){
          
          log.debug('Checking the user credentials...');
          
          if (user) {
            
            if (user.locked) {
              
              log.debug('User\'s credentials are invalid and locked');
              ret(null,null,null);
              
            } else {
              
              if (user.pass && pass) {
                
                bcrypt.compare(pass,user.pass,function(err,res) {
                  
                  if (err) ret(err,true,user);
                  else if (res===true) {

                    log.debug('User\'s credentials are fine.');

                    ret(null,false,user);

                  } else ret(null,true,user);
                  
                });
              
              } else if (!user.pass && !pass) {
                
                log.debug('User\'s credentials have not set');
                ret(null,null,user);
                
              } else {
                
                log.debug('User\'s credentials are invalid');
                ret(null,null,null);
              }
            } 
            
          } else ret(null,null,null);
        },
        
        function tryLock(wrong,user,ret) {
          
          if (wrong && lockOnFail) {
            
            log.debug('User\'s credentials are invalid. Locking...');
            
            self.update({id:user.id},{locked:new Date()},function(err,u){
              ret(err,(u)?user:null);
            });
            
          } else ret(null,user);
        },
        
        function getEnv(user,ret) {
          
          if (user && needEnv) {
            
            self.getEnvironment(user,function(err,user,env){
              ret(err,user,env);
            });
                
          } else ret(null,user,null);
        }
        
        
      ],function(err,user,env){
        result(err,user,env);
      });
      
    } else result(null,null,null);
  },
  
  getByRequest: function(req,result) {
    
    if (req && req.body && req.body.auth) {
            
      UsersModel.getByLogin(req.body.auth.login,req.body.auth.pass,false,false,
                       function(err,user){
        result(err,user);
      });

    } else if (req.session && req.session.userId) {

      UsersModel.findOneById(req.session.userId,function(err,user){
        
        if (err) result(err,null);
        else result(null,user);
      });

    } else result(null,null);
  }
  
};

