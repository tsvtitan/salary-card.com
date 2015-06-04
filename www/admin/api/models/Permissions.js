
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
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
    
  },
  
  forView: function (userOrLogin,entity,action,result) {
    
    var self = this;
    var log = this.log;
    
    function get(user) {
      
      var where = {
        or: [
          { user: user.login },
          { role: user.roles }
        ],
        entity: entity,
        locked: [null,undefined,false]
      }
      where[action] = {'!':[null,undefined,false]};
      
      var fields = {}; fields[action] = 1;
      
      self.find({where:where,sort:{priority:1}},
                function(err,permissions){
        
        if (err) result(err);
        else if (Utils.isArray(permissions)) {
      
          var or = [];
          
          Utils.forEach(permissions,function(p){
            
            var a = p[action];
            if (Utils.isObject(a)) {
              or.push(Utils.makeFilter(a));
            }
          });
          
          var access = Utils.isEmpty(or)?false:{or:or};
          
          result(null,access);
          
        } else result();
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
  }
};