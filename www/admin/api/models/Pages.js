
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
    title: 'string',
    description: 'string',
    url: 'string',
    template: 'string',
    priority: 'integer',
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
            
            Permissions.forFind(user,'pages','view',function(err,access){
              
              ret(err,access);
            });
            
          } else ret(null,null);
        },
        
        function getPages(access,ret) {
          
          var where = {locked:[null,undefined,false]};
          
          where = Utils.extend(where,access);
          
          self.find({where:where,sort:{priority:1}},{fields:fields},
                    function(err,pages){
            ret(err,pages);          
          });
        }
        
      ],function(err,pages){
        result(err,Utils.remainKeys(pages,fields));
      });
      
    } else result(null,[]);
  }
  
}