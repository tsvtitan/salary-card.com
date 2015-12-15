
module.exports = {
  
  tableName: 'menu',
  migrate: 'safe',
  autoPK: true, //need for id
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    
    title: {
      type: 'string',
      required: true
    },
    description: 'string',
    items: 'json',
    priority: 'integer',
    page: 'string',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }/*,
  
  getByUser: function (userOrId,where,fields,result) {
    
    var log = this.log;
    var self = this;
    
    if (userOrId) {

      async.waterfall([
        
        function getUser(ret) {
          
          if (Utils.isObject(userOrId)) {
            ret(null,userOrId);
          } else {
            
            UsersModel.findOneById(userOrId,function(err,user){
              
              ret(err,user);
            });
          }
        },
        
        function getAccess(user,ret) {
          
          if (user) {
            
            PermissionsModel.forFind(user,'menu','view',function(err,access){
              
              ret(err,access);
            });
            
          } else ret(null,null);
        },
        
        function getMenu(access,ret) {
          
          if (access) {
            
            var w = {locked:[null,false]};
            w = Utils.extend(w,where);
            w = Utils.extend(w,access);
          
            self.find({where:w,sort:{priority:1}},{fields:fields},
                      function(err,menu){
              ret(err,menu);          
            });
            
          } else ret(null,[]);
        }
        
      ],function(err,menu){
        result(err,Utils.remainKeys(menu,fields));
      });
      
    } else result(null,[]);
  }
  */
}