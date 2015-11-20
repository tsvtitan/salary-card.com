
var XLSX = require('xlsx');

module.exports = {

  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    amount: {
      type: 'integer',
      required: true
    },
    grade: 'integer',
    priority: 'integer',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  changeKeys: ['id'],
  
  import: function(user,params,files,result) {
    
    var self = this;
    
    async.waterfall([
     
      function getData(ret) {
        
        var options = {
          history: true
        };
        
        Imports.fromFiles(user,self,files,['xlsx','xls'],options,function(imp,cb){
          
          try {
            
            var data = null;
            
            var workbook = XLSX.readFileSync(imp.source);
            if (Utils.isObject(workbook)) {
              
              var sheet = workbook.Sheets[self.tableName];
              if (Utils.isObject(sheet))
                data = XLSX.utils.sheet_to_json(sheet);
            }
            
            cb(null,data);
            
          } catch(e) {
            cb(e.message);
          }  
          
        },function(err,data){
          ret(err,data);
        });
      },
      
      function importData(data,ret) {
        
        var priority = 0;
        
        async.eachSeries(data,function(d,cb){
          
          if (d) {
            
            var strength = {
              amount: d.amount,
              grade: d.grade,
              priority: priority++,
              lang: Utils.isObject(user)?user.lang:null 
            };

            self.create(strength,function(err){
              cb(err);
            });
            
          } else cb(null);
          
        },function(err){
          ret(err);
        });
      }
      
    ],function(err){
      result(err,{reload:true});
    });
   
  },
  
  options: function(user,params,files,result) {
    
    this.log.debug(params);
    
    result(null,{reload:true});

  }
  
}