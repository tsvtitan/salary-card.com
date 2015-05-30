
module.exports = {

  migrate: 'safe',
  autoPK: false,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    
    name: {
      type: 'string',
      required: true
    },
    description: 'string',
    items: 'json',
    priority: 'integer',
    state: 'string',
    locked: 'datetime',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  getByUser: function (userOrId,fields,result) {
    
    var log = this.log;
    var self = this;
    
    if (userOrId) {

      async.waterfall([
        
        function getUser(ret) {
          
          if (Utils.isObject(userOrId)) {
            ret(null,userOrId);
          } else {
            
            self.findOneById(userOrId,function(err,user){
              
              ret(err,user);
            });
          }
        },
        
        function getAccess(user,ret) {
          
          if (user) {
            
            Permissions.forFind(user,'menu','view',function(err,access){
              
              ret(err,access);
            });
            
          } else ret(null,null);
        },
        
        function getMenu(access,ret) {
          
          var where = {locked:[null,undefined,false]};
          
          where = Utils.extend(where,access);
          
          self.find({where:where,sort:{priority:1}},{fields:fields},
                    function(err,menu){
            ret(err,menu);          
          });
        }
        
      ],function(err,menu){
        result(err,Utils.remainKeys(menu,fields));
      });
      
    } else result(null,[]);
  }
  
}