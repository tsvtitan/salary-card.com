
module.exports = {

  migrate: 'safe',
  autoPK: true, // need for id
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
  
  getByUser: function (userOrId,where,fields,result) {
    
    var log = this.log;
    var self = this;
    
    if (userOrId) {

      async.waterfall([
        
        function getUser(ret) {
          
          if (Utils.isObject(userOrId)) {
            ret(null,userOrId);
          } else {
            
            Users.findOneById(userOrId,function(err,user){
              
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
          
          if (access) {
            
            var w = {locked:[null,false]};
            w = Utils.extend(w,where);
            w = Utils.extend(w,access);
            
            self.find({where:w,sort:{priority:1}},{fields:fields},
                      function(err,pages){
              
              ret(err,pages);          
            });
            
          } else ret(null,[]);
        }
        
      ],function(err,pages){
        result(err,Utils.remainKeys(pages,fields));
      });
      
    } else result(null,[]);
  },
  
  getByUserOne: function (userOrId,where,fields,result) {
    
    this.getByUser(userOrId,where,fields,function(err,pages){
      
      var page = null;
      if (Utils.isArray(pages) && pages.length>0) {
        page = pages[0];
      }
      result(err,page);
    });
  }
  
}