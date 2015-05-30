
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
  
    interface: {
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
  
  forFind: function (userOrLogin,interface,action,result) {
    
    var self = this;
    
    function get(login) {
      
      var where = {
        login: login,
        interface: interface,
        locked: [null,undefined,false]
      }
      where[action] = {'!':[null,undefined,false]};
      
      var fields = {}; fields[action] = 1;
      
      self.find({where:where,sort:{priority:1}},
                function(err,permissions){
        
        if (err) result(err);
        else if (Utils.isArray(permissions)) {
      
          var access = {};
          
          Utils.forEach(permissions,function(p){
            
            var a = p[action];
            if (Utils.isObject(a)) {
              access = Utils.extend(access,Utils.makeFilter(a));
            }
          });
          
          result(null,access);
          
        } else result();
      });
    }
    
    if (Utils.isObject(userOrLogin))
      get(userOrLogin.login);
    else get(userOrLogin);
  }
};