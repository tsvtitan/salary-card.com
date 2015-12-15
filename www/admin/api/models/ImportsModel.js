
module.exports = {
  
  tableName: 'imports',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    table: {
      type: 'string',
      required: true
    },
    creator: 'string',
    created: 'datetime',
    source: 'string',
    size: 'integer',
    name: 'string',
    data: 'json',
    priority: 'integer',
    error: 'string',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  fromFiles: function(user,model,files,extensions,options,getData,result) {
    
    var log = this.log;
    var self = this;
    
    async.waterfall([
     
      function filterFiles(ret) {
        
        var list = Utils.filter(files,function(f){
          
          var ext = Utils.fileExtension(f.filename).toLowerCase();
          return extensions.indexOf(ext)!==-1;
        });
        
        ret(null,list);
      },
      
      function createImports(list,ret) {
        
        if (!Utils.isEmpty(list)) {
          
          async.map(list,function(l,cb){
            
            var imp = {
              table: model.tableName,
              creator: Utils.isObject(user)?user.login:null,
              created: moment().toDate(),
              source: l.fd,
              size: l.size,
              name: l.filename,
              priortiy: list.indexOf(l),
              lang: Utils.isObject(user)?user.lang:null
            };
            
            self.create(imp,function(err,i){
              
              if (i) {
                l.keep = true;
              }
              cb(err,i);
            });
            
          },function(err,imports){
            ret(err,imports);
          });
          
        } else ret('Files are not found');
      },
      
      function readImports(imports,ret) {
        
        if (!Utils.isEmpty(imports)) {
          
          async.each(imports,function(i,cb){
          
            getData(i,function(err,data){
            
              i.data = data;
              cb(err);
            });
            
          },function(err){
            ret(err,imports);
          });
          
        } else ret('Imports are not found');
        
      },
      
      function updateImports(imports,ret) {
        
        async.map(imports,function(i,cb){
          
          self.update({id:i.id},{data:i.data},function(err){
            cb(err,i.data);
          });
          
        },function(err,results){
          
          var data = [];
          Utils.forEach(results,function(r){
            if (r) data = data.concat(r);
          });
          ret(err,data);
        });
      },
      
      function makeHistory(data,ret) {
        
        if (!Utils.isEmpty(data)) {
          
          if (options) {
            
            var where = {
              locked:[null,false],
              lang: Utils.isObject(user)?user.lang:null 
            };
            
            if (options.history) {
              
              model.update(where,{locked:moment().toDate()},
                           function(err){
                ret(err,data);            
              });
              
            } else {
              
              model.destroy(where,function(err){
                ret(err,data);            
              });
            }
            
          } else ret(null,data);
          
        } else ret('Data are not found');
      }
      
    ],function(err,data){
      result(err,data);
    });
  }
  
}