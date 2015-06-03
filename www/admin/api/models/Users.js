var bcrypt = require('bcrypt');    

module.exports = {

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
    page: {
      type: 'string'
    },
    locked: {
      type: 'datetime'
    },
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  setPassHash: function(user,result) {
    
    var log = Users.log;
    
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
  
  getEnvironment: function(userOrId,result) {
    
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
              getter: Pages,
              where: {},
              fields: {id:1,name:1,title:1,description:1,url:1,template:1,
                      breadcrumbs:1}
            });
            
            items.push({
              name: 'menu',
              getter: Menu,
              where: {},
              fields: {title:1,description:1,page:1,items:1,class:1}
            });

            async.map(items,function(item,cb){

              item.getter.getByUser(user,item.where,item.fields,function(err,r){
                cb(err,{name:item.name,obj:r});
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

                  if (err) ret(err);
                  else if (res===true) {

                    log.debug('User\'s credentials are fine.');

                    ret(null,false,user);

                  } else ret(null,true,user);
                  
                });
              
              } else {
                
                if (!user.pass && !pass) {
                  
                  log.debug('User\'s credentials have not set');
                  ret(null,null,user);
                }
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
  }
  
};

