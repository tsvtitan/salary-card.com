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
    locked: 'datetime',
    lang: 'string',
    
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
  
  getEnvironment: function (userOrId,result) {
    
    var self = this;
    
    async.waterfall([

      function findUser(ret){

        if (userOrId) {
          
          if (Utils.isObject(userOrId)) {

            ret(null,userOrId);

          } else {

            self.findOneById(userOrId,function(err,user){
              ret(err,user);
            });
          }
          
        } else ret(null,null);
      },

      function collect(user,ret){

        var items = [];

        items.push({
          name: 'pages',
          model: Pages,
          where: {},
          fields: {name:1,title:1,description:1,url:1,template:1,breadcrumbs:1,auth:1}
        });

        /*items.push({
          name: 'menu',
          model: Menu,
          where: {},
          fields: {title:1,description:1,page:1,items:1,class:1}
        });*/

        async.map(items,function(i,cb){

          var w = {
            locked: [null,false],
            lang: (user && user.lang)?user.lang:null
          };

          w = Utils.extend(w,i.where);

          i.model.find({where:w,sort:{priority:1}},{fields:i.fields},
                       function(err,table){

            cb(err,{name:i.name,obj:table});         
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
      }

    ],function(err,user,env){
      result(err,user,env);
    });
    
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

