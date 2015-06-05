
module.exports = {

  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    login: {
      type: 'string',
      required: true
    },
  
    entity: {
      type: 'string',
      required: true
    },
    descriptions: 'string',
    access: 'json',
    locked: 'datetime',
    priority: 'integer',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
    
  },
  
  getAccess: function (userOrLogin,entity,action,result) {
    
    var self = this;
    var log = this.log;
    
    function get(user) {
      
      var where = {
        or: [
          { user: user.login },
          { role: user.roles }
        ],
        entity: entity,
        locked: [null,false],
        lang: (user.lang)?user.lang:null
      }
      where[action] = {'!':[null,false]};
      
      var fields = {}; fields[action] = 1;
      
      self.find({where:where,sort:{priority:1}},
                function(err,permissions){
        
        if (err) result(err);
        else if (Utils.isArray(permissions)) {
      
          var access = [];
          
          Utils.forEach(permissions,function(p){
            
            var a = p[action];
            if (a) access.push(a);

          });
          
          result(null,access,user);
          
        } else result(null,null,user);
      });
    }
    
    if (Utils.isObject(userOrLogin)) {
      
      get(userOrLogin);
      
    } else {
      
      Users.findOneByLogin(userOrLogin,function(err,user){
        
        if (err) result(err);
        else get(user);
      });
    }
  },
  
  asWhere: function (userOrLogin,entity,action,def,result) {
    
    this.getAccess(userOrLogin,entity,action,function(err,access,user){
      
      if (access && Utils.isArray(access)) {
        
        var arr = [];
        
        Utils.forEach(access,function(a){
          
          if (Utils.isObject(a)) {
            arr.push(Utils.makeFilter(a));
          }
        });
        
        access = Utils.isEmpty(arr)?def:{or:arr};
      
      } else access = def;
      
      result(err,access,user);
    });
  },
  
  asOr: function (userOrLogin,entity,action,def,result) {
    
    this.getAccess(userOrLogin,entity,action,function(err,access,user){
      
      if (access && Utils.isArray(access)) {
        
        var flag = def;
        
        for (var a in access) {
          if (a) {
            flag = true;
            break;
          }
        }
        
        access = flag;
        
      } else access = def;
      
      result(err,access,user);
    });
  }
};