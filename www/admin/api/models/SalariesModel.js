
var XLSX = require('xlsx');

module.exports = {
  
  tableName: 'salaries',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    position: {
      type: 'integer',
      required: true
    },
    90: 'float',
    75: 'float',
    50: 'float',
    25: 'float',
    10: 'float',
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
        
        ImportsModel.fromFiles(user,self,files,['xlsx','xls'],options,function(imp,cb){
          
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
            
            var salary = {
              position: d.position,
              90: (d['90'])?parseFloat(d['90']):null,
              75: (d['75'])?parseFloat(d['75']):null,
              50: (d['50'])?parseFloat(d['50']):null,
              25: (d['25'])?parseFloat(d['25']):null,
              10: (d['10'])?parseFloat(d['10']):null,
              priority: priority++,
              lang: Utils.isObject(user)?user.lang:null 
            };

            self.create(salary,function(err,s){
              cb(err,s);
            });
            
          } else cb(null);  
          
        },function(err){
          ret(err);
        });
      }
      
    ],function(err){
      result(err,{reload:true});
    });
  }
  
}